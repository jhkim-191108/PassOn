package com.nextshift.handoff;

import tools.jackson.databind.JsonNode;
import tools.jackson.databind.ObjectMapper;
import tools.jackson.databind.node.ArrayNode;
import tools.jackson.databind.node.ObjectNode;
import com.nextshift.config.AppProperties;
import com.nextshift.domain.CardType;
import com.nextshift.domain.Urgency;
import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.time.Duration;
import java.util.ArrayList;
import java.util.List;
import org.springframework.stereotype.Service;

/** 인수인계 원문을 카드 초안으로 나눈다. 키가 없으면 규칙 분류, 있으면 OpenAI를 쓴다. */
public interface HandoffAnalyzer {
    List<CardDraft> analyze(String rawText, List<CorrectionExample> examples);

    /** 모델이나 규칙 분류가 돌려준 카드 한 장. 아직 DB에 없다. */
    record CardDraft(
            CardType type,
            String title,
            String body,
            Urgency urgency,
            boolean needsReview,
            String sourceQuote
    ) {}

    /** 같은 매장에서 사람이 고친 분류. 모델 프롬프트에 예시로 넣는다. */
    record CorrectionExample(String sourceQuote, CardType fromType, CardType toType) {}
}

/** API 키 유무에 따라 규칙 분류와 OpenAI 분류를 고른다. */
@Service
class RoutingHandoffAnalyzer implements HandoffAnalyzer {
    private final FixtureHandoffAnalyzer fixture = new FixtureHandoffAnalyzer();
    private final OpenAiHandoffAnalyzer openAi;
    private final AppProperties properties;

    RoutingHandoffAnalyzer(AppProperties properties, ObjectMapper objectMapper) {
        this.properties = properties;
        this.openAi = new OpenAiHandoffAnalyzer(properties, objectMapper);
    }

    /** 키가 비어 있으면 키워드 분류, 있으면 OpenAI를 호출한다. */
    @Override
    public List<CardDraft> analyze(String rawText, List<CorrectionExample> examples) {
        String apiKey = properties.openai() == null ? null : properties.openai().apiKey();
        if (apiKey == null || apiKey.isBlank()) {
            return fixture.analyze(rawText, examples);
        }
        return openAi.analyze(rawText, examples);
    }
}

/** 키워드로 카드 종류와 중요도를 나누는 개발용 분류기. */
class FixtureHandoffAnalyzer implements HandoffAnalyzer {
    @Override
    public List<CardDraft> analyze(String rawText, List<CorrectionExample> examples) {
        List<CardDraft> cards = new ArrayList<>();
        for (String part : rawText.split("[\\n.]+")) {
            String line = part.trim();
            if (line.isEmpty()) {
                continue;
            }
            cards.add(classify(line));
        }
        if (cards.isEmpty()) {
            throw new IllegalStateException("카드를 만들지 못했습니다.");
        }
        return cards;
    }

    private static CardDraft classify(String line) {
        CardType type = CardType.TASK;
        Urgency urgency = Urgency.LATER;
        if (contains(line, "손님", "단골", "디카페인")) {
            type = CardType.GUEST;
        } else if (contains(line, "원두", "우유", "재고", "떨어", "없음")) {
            type = CardType.STOCK;
        } else if (contains(line, "내일", "입고", "공지")) {
            type = CardType.NOTICE;
        }
        if (contains(line, "없음", "거의", "급")) {
            urgency = Urgency.NOW;
        } else if (contains(line, "내일", "오늘")) {
            urgency = Urgency.TODAY;
        }
        String title = line.length() > 120 ? line.substring(0, 120) : line;
        return new CardDraft(type, title, "", urgency, false, line.length() > 200 ? line.substring(0, 200) : line);
    }

    private static boolean contains(String line, String... words) {
        for (String word : words) {
            if (line.contains(word)) {
                return true;
            }
        }
        return false;
    }
}

/** OpenAI 채팅 API에 원문을 보내고 카드 JSON을 받는다. */
class OpenAiHandoffAnalyzer implements HandoffAnalyzer {
    private final AppProperties properties;
    private final ObjectMapper objectMapper;
    private final HttpClient httpClient = HttpClient.newBuilder().connectTimeout(Duration.ofSeconds(10)).build();

    OpenAiHandoffAnalyzer(AppProperties properties, ObjectMapper objectMapper) {
        this.properties = properties;
        this.objectMapper = objectMapper;
    }

    @Override
    public List<CardDraft> analyze(String rawText, List<CorrectionExample> examples) {
        try {
            ObjectNode body = objectMapper.createObjectNode();
            String model = properties.openai().model();
            body.put("model", model == null || model.isBlank() ? "gpt-6-luna" : model);
            body.put("reasoning_effort", "none");
            body.putObject("response_format").put("type", "json_object");
            ArrayNode messages = body.putArray("messages");
            messages.addObject().put("role", "system").put("content", systemPrompt());
            messages.addObject().put("role", "user").put("content", userPrompt(rawText, examples));

            HttpRequest request = HttpRequest.newBuilder()
                    .uri(URI.create("https://api.openai.com/v1/chat/completions"))
                    .timeout(Duration.ofSeconds(30))
                    .header("Authorization", "Bearer " + properties.openai().apiKey())
                    .header("Content-Type", "application/json")
                    .POST(HttpRequest.BodyPublishers.ofString(objectMapper.writeValueAsString(body)))
                    .build();
            HttpResponse<String> response = httpClient.send(request, HttpResponse.BodyHandlers.ofString());
            if (response.statusCode() >= 300) {
                String detail = response.body() == null ? "" : response.body().replaceAll("\\s+", " ").trim();
                if (detail.length() > 240) {
                    detail = detail.substring(0, 240);
                }
                throw new IllegalStateException("모델 호출에 실패했습니다. " + response.statusCode() + " " + detail);
            }

            String content = objectMapper.readTree(response.body()).path("choices").path(0).path("message").path("content").asString();
            return parse(content);
        } catch (IllegalStateException ex) {
            throw ex;
        } catch (Exception ex) {
            throw new IllegalStateException("모델 응답을 읽지 못했습니다.");
        }
    }

    private List<CardDraft> parse(String content) throws Exception {
        String json = content.trim();
        if (json.startsWith("```")) {
            json = json.replace("```json", "").replace("```", "").trim();
        }
        JsonNode cards = objectMapper.readTree(json).path("cards");
        if (!cards.isArray() || cards.isEmpty()) {
            throw new IllegalStateException("카드를 만들지 못했습니다.");
        }
        List<CardDraft> drafts = new ArrayList<>();
        for (JsonNode card : cards) {
            drafts.add(new CardDraft(
                    enumOr(CardType.class, card.path("type").asString(), CardType.TASK),
                    card.path("title").asString("확인 필요"),
                    card.path("body").asString(""),
                    enumOr(Urgency.class, card.path("urgency").asString(), Urgency.LATER),
                    card.path("needsReview").asBoolean(false),
                    card.path("sourceQuote").asString("")));
        }
        return drafts;
    }

    private static <E extends Enum<E>> E enumOr(Class<E> type, String raw, E fallback) {
        try {
            return Enum.valueOf(type, raw.trim().toUpperCase());
        } catch (RuntimeException ex) {
            return fallback;
        }
    }

    private static String systemPrompt() {
        return """
                너는 매장 인수인계를 카드로 나누는 분류기다.
                원문에 있는 사실만 카드로 만든다. 수량과 이름을 지어내지 않는다.
                type은 STOCK, TASK, GUEST, NOTICE 중 하나다.
                urgency는 NOW, TODAY, LATER 중 하나다.
                sourceQuote는 원문의 연속된 부분 문자열이어야 한다. 못 집으면 needsReview를 true로 한다.
                JSON만 출력한다. 형식은 {"cards":[{"type":"STOCK","title":"","body":"","urgency":"NOW","needsReview":false,"sourceQuote":""}]} 다.
                """;
    }

    private static String userPrompt(String rawText, List<CorrectionExample> examples) {
        StringBuilder builder = new StringBuilder();
        builder.append("원문:\n").append(rawText).append("\n\n사람이 고친 최근 분류:\n");
        if (examples.isEmpty()) {
            builder.append("없음");
        } else {
            for (CorrectionExample example : examples) {
                builder.append("- \"").append(example.sourceQuote()).append("\" : ")
                        .append(example.fromType()).append(" -> ").append(example.toType()).append('\n');
            }
        }
        return builder.toString();
    }
}