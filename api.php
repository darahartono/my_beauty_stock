
<?php

require_once 'auth.php';

header('Content-Type: application/json; charset=utf-8');

// Fungsi respons JSON
function respond(int $status, array $payload): void {
    http_response_code($status);
    echo json_encode($payload, JSON_UNESCAPED_UNICODE);
    exit;
}

// Periksa login admin
if (!isLoggedIn()) {
    respond(401, [
        'success' => false,
        'message' => 'Silakan login terlebih dahulu.'
    ]);
}

// Menggunakan koneksi dari database.php
require_once 'database.php';

$method = $_SERVER['REQUEST_METHOD'] ?? 'GET';

// MENGAMBIL SELURUH PRODUK
if ($method === 'GET') {
    try {
        $stmt = $pdo->query(
            'SELECT id, name, category, quantity, expiry_date, created_at, updated_at
             FROM products
             ORDER BY expiry_date ASC, name ASC'
        );

        respond(200, [
            'success' => true,
            'data' => $stmt->fetchAll()
        ]);

    } catch (PDOException $e) {
        error_log($e->getMessage());

        respond(500, [
            'success' => false,
            'message' => 'Gagal mengambil data produk.'
        ]);
    }
}

// HANYA MENERIMA GET DAN POST
if ($method !== 'POST') {
    header('Allow: GET, POST');

    respond(405, [
        'success' => false,
        'message' => 'Metode permintaan tidak didukung.'
    ]);
}

// MEMBACA DATA JSON
$input = json_decode(file_get_contents('php://input'), true);

if (!is_array($input)) {
    respond(400, [
        'success' => false,
        'message' => 'Data yang dikirim tidak valid.'
    ]);
}

$action = $input['action'] ?? '';

try {

    // TAMBAH DAN EDIT PRODUK
    if ($action === 'create' || $action === 'update') {

        $name = trim((string)($input['name'] ?? ''));
        $category = trim((string)($input['category'] ?? ''));

        $quantity = filter_var(
            $input['quantity'] ?? null,
            FILTER_VALIDATE_INT
        );

        $expiryDate = (string)($input['expiry_date'] ?? '');

        $allowedCategories = [
            'Skincare',
            'Makeup',
            'Body Care',
            'Hair Care',
            'Parfum',
            'Lainnya'
        ];

        if ($name === '' || mb_strlen($name) > 120) {
            respond(422, [
                'success' => false,
                'message' => 'Nama produk wajib diisi maksimal 120 karakter.'
            ]);
        }

        if (!in_array($category, $allowedCategories, true)) {
            respond(422, [
                'success' => false,
                'message' => 'Kategori produk tidak valid.'
            ]);
        }

        if ($quantity === false || $quantity < 0) {
            respond(422, [
                'success' => false,
                'message' => 'Jumlah stok harus berupa bilangan bulat minimal 0.'
            ]);
        }

        $date = DateTime::createFromFormat('!Y-m-d', $expiryDate);

        if (!$date || $date->format('Y-m-d') !== $expiryDate) {
            respond(422, [
                'success' => false,
                'message' => 'Tanggal kedaluwarsa tidak valid.'
            ]);
        }

        // TAMBAH PRODUK
        if ($action === 'create') {

            $stmt = $pdo->prepare(
                'INSERT INTO products
                (name, category, quantity, expiry_date)
                VALUES
                (:name, :category, :quantity, :expiry_date)'
            );

            $stmt->execute([
                ':name' => $name,
                ':category' => $category,
                ':quantity' => $quantity,
                ':expiry_date' => $expiryDate
            ]);

            respond(201, [
                'success' => true,
                'message' => 'Produk berhasil ditambahkan.',
                'id' => (int)$pdo->lastInsertId()
            ]);
        }

        // EDIT PRODUK
        $id = filter_var(
            $input['id'] ?? null,
            FILTER_VALIDATE_INT
        );

        if ($id === false || $id < 1) {
            respond(422, [
                'success' => false,
                'message' => 'ID produk tidak valid.'
            ]);
        }

        $stmt = $pdo->prepare(
            'UPDATE products
             SET name = :name,
                 category = :category,
                 quantity = :quantity,
                 expiry_date = :expiry_date,
                 updated_at = CURRENT_TIMESTAMP
             WHERE id = :id'
        );

        $stmt->execute([
            ':name' => $name,
            ':category' => $category,
            ':quantity' => $quantity,
            ':expiry_date' => $expiryDate,
            ':id' => $id
        ]);

        if ($stmt->rowCount() === 0) {
            $check = $pdo->prepare(
                'SELECT id FROM products WHERE id = :id'
            );

            $check->execute([':id' => $id]);

            if (!$check->fetch()) {
                respond(404, [
                    'success' => false,
                    'message' => 'Produk tidak ditemukan.'
                ]);
            }
        }

        respond(200, [
            'success' => true,
            'message' => 'Produk berhasil diperbarui.'
        ]);
    }

    // HAPUS PRODUK
    if ($action === 'delete') {

        $id = filter_var(
            $input['id'] ?? null,
            FILTER_VALIDATE_INT
        );

        if ($id === false || $id < 1) {
            respond(422, [
                'success' => false,
                'message' => 'ID produk tidak valid.'
            ]);
        }

        $stmt = $pdo->prepare(
            'DELETE FROM products WHERE id = :id'
        );

        $stmt->execute([':id' => $id]);

        if ($stmt->rowCount() === 0) {
            respond(404, [
                'success' => false,
                'message' => 'Produk tidak ditemukan atau sudah dihapus.'
            ]);
        }

        respond(200, [
            'success' => true,
            'message' => 'Produk berhasil dihapus.'
        ]);
    }

    respond(400, [
        'success' => false,
        'message' => 'Aksi tidak dikenali.'
    ]);

} catch (PDOException $e) {

    error_log($e->getMessage());

    respond(500, [
        'success' => false,
        'message' => 'Terjadi kesalahan saat memproses data produk.'
    ]);
}
