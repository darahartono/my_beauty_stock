
<?php

if (session_status() === PHP_SESSION_NONE) {
    session_start();
}

define('OWNER_USERNAME', 'admin');
define('OWNER_PASSWORD_HASH', password_hash('BeautyStock123!', PASSWORD_DEFAULT));

function isLoggedIn(): bool {
    return isset($_SESSION['owner_logged_in']) &&
           $_SESSION['owner_logged_in'] === true;
}

function requireLogin(): void {
    if (!isLoggedIn()) {
        header('Location: login.php');
        exit;
    }
}
