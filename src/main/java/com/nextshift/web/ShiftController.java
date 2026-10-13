package com.nextshift.web;

import com.nextshift.api.Views.ShiftView;
import com.nextshift.common.AuthPrincipal;
import com.nextshift.service.ShiftService;
import jakarta.validation.Valid;
import java.time.LocalDate;
import java.util.List;
import java.util.UUID;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

/** 근무표. 조회는 재직 멤버, 배정과 취소는 오너와 매니저. */
@RestController
@RequestMapping("/api/stores/{storeId}/shifts")
public class ShiftController {
    private final ShiftService shiftService;

    public ShiftController(ShiftService shiftService) {
        this.shiftService = shiftService;
    }

    @GetMapping
    public List<ShiftView> list(
            @PathVariable UUID storeId,
            @RequestParam LocalDate from,
            @RequestParam LocalDate to
    ) {
        return shiftService.list(AuthPrincipal.current(), storeId, from, to);
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public ShiftView create(@PathVariable UUID storeId, @Valid @RequestBody ShiftRequest request) {
        return shiftService.create(
                AuthPrincipal.current(),
                storeId,
                request.memberId(),
                request.workDate(),
                request.slot()
        );
    }

    @DeleteMapping("/{shiftId}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void delete(@PathVariable UUID storeId, @PathVariable UUID shiftId) {
        shiftService.delete(AuthPrincipal.current(), storeId, shiftId);
    }
}