
<?php
require_once 'auth.php';

if (isLoggedIn()) {
    header('Location: dashboard.php');
    exit;
}

$error = '';

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $username = trim($_POST['username'] ?? '');
    $password = $_POST['password'] ?? '';

    if (
        $username === OWNER_USERNAME &&
        password_verify($password, OWNER_PASSWORD_HASH)
    ) {
        session_regenerate_id(true);
        $_SESSION['owner_logged_in'] = true;

        header('Location: dashboard.php');
        exit;
    }

    $error = 'Username atau password yang kamu masukkan salah.';
}
?>

<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Login | My Beauty Stock</title>
    <link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&family=Playfair+Display:wght@600;700&display=swap" rel="stylesheet">
    <link rel="stylesheet" href="style.css">
</head>
<body class="login-body">

<div class="login-container">
    <a href="index.php" class="login-back">← Kembali ke Home</a>

    <div class="login-card">
        <div class="login-logo">✦</div>

        <p class="landing-label">WELCOME BACK</p>
        <h1>My Beauty Stock</h1>
        <p class="login-description">
            Masuk untuk mengelola koleksi kosmetik pribadimu.
        </p>

        <?php if ($error): ?>
            <div class="login-error">
                <?= htmlspecialchars($error, ENT_QUOTES, 'UTF-8') ?>
            </div>
        <?php endif; ?>

        <form method="POST" action="login.php">
            <div class="field">
                <label for="username">Username</label>
                <input type="text" id="username" name="username"
                       placeholder="Masukkan username" required>
            </div>

            <div class="field">
                <label for="password">Password</label>
                <input type="password" id="password" name="password"
                       placeholder="Masukkan password" required>
            </div>

            <button type="submit" class="button button-primary login-submit">
                Login <span>↗</span>
            </button>
        </form>

        <p class="login-note">♡ Your beauty collection, well organized.</p>
    </div>
</div>

</body>
</html>
