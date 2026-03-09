package keycloak.crash.course.resourceserver.controller;

import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api")
@CrossOrigin(origins = "http://localhost:3000")
public class DemoController {

    @PreAuthorize("hasAuthority('SCOPE_read:videos')")
    @GetMapping("/videos")
    public Response getVideos() {
        return new Response("User is allowed to get videos!");
    }

    @PreAuthorize("hasAuthority('SCOPE_read:books')")
    @GetMapping("/books")
    public Response getBooks() {
        return new Response("User is allowed to get books!");
    }

    public record Response(String message) {
    }
}
