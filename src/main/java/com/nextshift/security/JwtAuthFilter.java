package com.nextshift.security;

import com.nextshift.common.AuthPrincipal;
import com.nextshift.domain.User;
import com.nextshift.repo.UserRepository;
import io.jsonwebtoken.JwtException;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import java.io.IOException;
import java.util.List;
import org.springframework.http.HttpHeaders;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

/** Authorization: Bearer 를 읽어 사용자를 SecurityContext에 넣는다. 실패해도 여기서 거절하지 않는다. */
@Component
public class JwtAuthFilter extends OncePerRequestFilter {
    private final JwtService jwtService;
    private final UserRepository userRepository;

    public JwtAuthFilter(JwtService jwtService, UserRepository userRepository) {
        this.jwtService = jwtService;
        this.userRepository = userRepository;
    }

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain chain)
            throws ServletException, IOException {
        String header = request.getHeader(HttpHeaders.AUTHORIZATION);
        if (header != null && header.startsWith("Bearer ")) {
            authenticate(header.substring(7));
        }
        chain.doFilter(request, response);
    }

    private void authenticate(String token) {
        try {
            User user = userRepository.findById(jwtService.userId(token)).orElse(null);
            if (user == null || user.getDeletedAt() != null) {
                return;
            }
            AuthPrincipal principal = new AuthPrincipal(user.getId(), user.getEmail());
            var authentication = new UsernamePasswordAuthenticationToken(principal, null, List.of());
            SecurityContextHolder.getContext().setAuthentication(authentication);
        } catch (JwtException | IllegalArgumentException ignored) {
            SecurityContextHolder.clearContext();
        }
    }
}