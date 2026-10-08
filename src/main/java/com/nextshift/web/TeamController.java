package com.nextshift.web;

import com.nextshift.api.Views.TeamView;
import com.nextshift.common.AuthPrincipal;
import com.nextshift.service.TeamService;
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

/** 매장 팀. 목록은 재직 멤버, 생성·수정·삭제는 오너. */
@RestController
@RequestMapping("/api/stores/{storeId}/teams")
public class TeamController {
    private final TeamService teamService;

    public TeamController(TeamService teamService) {
        this.teamService = teamService;
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public TeamView create(@PathVariable UUID storeId, @Valid @RequestBody TeamNameRequest request) {
        return teamService.create(AuthPrincipal.current(), storeId, request.name());
    }

    @GetMapping
    public List<TeamView> list(@PathVariable UUID storeId) {
        return teamService.list(AuthPrincipal.current(), storeId);
    }

    @PatchMapping("/{teamId}")
    public TeamView rename(@PathVariable UUID storeId, @PathVariable UUID teamId, @Valid @RequestBody TeamNameRequest request) {
        return teamService.rename(AuthPrincipal.current(), storeId, teamId, request.name());
    }

    @DeleteMapping("/{teamId}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void delete(@PathVariable UUID storeId, @PathVariable UUID teamId) {
        teamService.delete(AuthPrincipal.current(), storeId, teamId);
    }
}