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

@RestController
@RequestMapping("/api/stores")
public class StoreController {
    private final StoreService storeService;

    public StoreController(StoreService storeService) {
        this.storeService = storeService;
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public StoreView create(@Valid @RequestBody StoreRequest request) {
        return storeService.create(AuthPrincipal.current(), request.name(), request.type());
    }

    @GetMapping
    public List<StoreView> list() {
        return storeService.list(AuthPrincipal.current());
    }

    @GetMapping("/{storeId}")
    public StoreView get(@PathVariable UUID storeId) {
        return storeService.get(AuthPrincipal.current(), storeId);
    }

    @PatchMapping("/{storeId}")
    public StoreView update(@PathVariable UUID storeId, @Valid @RequestBody StoreRequest request) {
        return storeService.update(AuthPrincipal.current(), storeId, request.name());
    }

    @DeleteMapping("/{storeId}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void delete(@PathVariable UUID storeId) {
        storeService.delete(AuthPrincipal.current(), storeId);
    }
}