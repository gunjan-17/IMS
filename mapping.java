@GetMapping("/me")
public ResponseEntity<UserDTO> getCurrentUser(Authentication authentication) {
    return authService.getCurrentUser(authentication)
            .map(ResponseEntity::ok)
            .orElseGet(() -> ResponseEntity.status(HttpStatus.UNAUTHORIZED).build());
}

public Optional<UserDTO> getCurrentUser(Authentication authentication) {
        if (authentication == null || !authentication.isAuthenticated()) {
            return Optional.empty();
        }

        String username = authentication.getName();
        Optional<User> userOpt = userRepository.findByUsername(username);

        return userOpt.map(user -> new UserDTO(
            user.getId(),
            user.getUsername(),
            user.getName(),
            user.getRole().toString()
        ));
    }
