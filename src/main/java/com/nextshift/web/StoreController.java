package com.nextshift.web;

import com.nextshift.api.Views.StoreView;
import com.nextshift.common.AuthPrincipal;
import com.nextshift.service.StoreService;
import jakarta.validation.Valid;
import java.util.List;
import java.util.UUID;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

/** 매장 생성·조회·이름 수정·삭제. 삭제는 OWNER만 된다. */
@RestController
@RequestMapping("/api/stores")
public class StoreController {
    private final StoreService storeService;

    public StoreController(StoreService storeService) {
        this.storeService = storeService;
    }

    /** 매장을 만들고 요청한 사람을 오너로 넣는다. */
    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public StoreView create(@Valid @RequestBody StoreRequest request) {
        return storeService.create(AuthPrincipal.current(), request.name(), request.type());
    }

    /** 내가 활동 중인 매장 목록을 돌려준다. */
    @GetMapping
    public List<StoreView> list() {
        return storeService.list(AuthPrincipal.current());
    }

    /** 매장 한 건을 돌려준다. 직원에게는 초대 코드가 없다. */
    @GetMapping("/{storeId}")
    public StoreView get(@PathVariable UUID storeId) {
        return storeService.get(AuthPrincipal.current(), storeId);
    }

    /** 매장 이름을 고친다. 오너와 매니저만 가능하다. */
    @PatchMapping("/{storeId}")
    public StoreView update(@PathVariable UUID storeId, @Valid @RequestBody StoreRequest request) {
        return storeService.update(AuthPrincipal.current(), storeId, request.name());
    }

    /** 매장을 지운다. 오너만 가능하다. */
    @DeleteMapping("/{storeId}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void delete(@PathVariable UUID storeId) {
        storeService.delete(AuthPrincipal.current(), storeId);
    }
}