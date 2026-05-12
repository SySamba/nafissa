-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Hôte : 127.0.0.1
-- Généré le : lun. 11 mai 2026 à 13:35
-- Version du serveur : 10.4.32-MariaDB
-- Version de PHP : 8.0.30

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Base de données : `nafissa`
--

-- --------------------------------------------------------

--
-- Structure de la table `bookings`
--

CREATE TABLE `bookings` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `client_id` bigint(20) UNSIGNED NOT NULL,
  `provider_id` bigint(20) UNSIGNED DEFAULT NULL,
  `service_id` bigint(20) UNSIGNED NOT NULL,
  `status` enum('en_attente_admin','en_attente_prestataire','acceptee','refusee','payee','en_cours','terminee','annulee') DEFAULT 'en_attente_admin',
  `booking_date` date NOT NULL,
  `booking_time` time NOT NULL,
  `total_price` decimal(10,2) NOT NULL,
  `notes` text DEFAULT NULL,
  `location` varchar(255) DEFAULT NULL,
  `description` text DEFAULT NULL,
  `rating` tinyint(3) UNSIGNED DEFAULT NULL,
  `review` text DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Déchargement des données de la table `bookings`
--

INSERT INTO `bookings` (`id`, `client_id`, `provider_id`, `service_id`, `status`, `booking_date`, `booking_time`, `total_price`, `notes`, `location`, `description`, `rating`, `review`, `created_at`, `updated_at`) VALUES
(1, 2, 4, 1, 'terminee', '2026-04-10', '14:00:00', 5000.00, NULL, 'Mermoz, Dakar', 'Cours de maths pour mon fils en classe de 6ème.', NULL, NULL, '2026-04-13 11:49:27', '2026-04-13 11:49:27'),
(2, 3, 6, 5, 'terminee', '2026-04-15', '10:00:00', 15000.00, NULL, 'Sacré-Cœur, Dakar', 'Je voudrais un boubou pour la Tabaski. Tissu bazin riche bleu.', 5, NULL, '2026-04-13 11:49:27', '2026-04-13 20:20:35'),
(3, 1, 6, 9, 'terminee', '2026-04-13', '19:00:00', 25000.00, 'test', 'Mermoz, Dakar', 'test', NULL, NULL, '2026-04-13 12:29:39', '2026-04-13 21:00:00'),
(4, 3, 6, 9, 'terminee', '2026-04-15', '22:40:00', 25000.00, NULL, 'Sacré-Cœur, Dakar', 'test', 1, NULL, '2026-04-13 20:35:44', '2026-04-13 20:41:46'),
(5, 2, 6, 9, 'terminee', '2026-05-08', '19:00:00', 25000.00, NULL, 'Mermoz, Dakar', NULL, 5, NULL, '2026-05-08 17:26:38', '2026-05-08 17:30:30');

-- --------------------------------------------------------

--
-- Structure de la table `cache`
--

CREATE TABLE `cache` (
  `key` varchar(255) NOT NULL,
  `value` mediumtext NOT NULL,
  `expiration` bigint(20) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Structure de la table `cache_locks`
--

CREATE TABLE `cache_locks` (
  `key` varchar(255) NOT NULL,
  `owner` varchar(255) NOT NULL,
  `expiration` bigint(20) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Structure de la table `categories`
--

CREATE TABLE `categories` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `name` varchar(100) NOT NULL,
  `description` text DEFAULT NULL,
  `icon` varchar(100) DEFAULT NULL,
  `active` tinyint(1) NOT NULL DEFAULT 1,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Déchargement des données de la table `categories`
--

INSERT INTO `categories` (`id`, `name`, `description`, `icon`, `active`, `created_at`, `updated_at`) VALUES
(1, 'Ménage', 'Services de nettoyage et entretien maison', 'home', 1, '2026-04-13 11:49:27', '2026-04-13 11:49:27'),
(2, 'Garde d\'enfants', 'Baby-sitting et garde d\'enfants', 'baby', 1, '2026-04-13 11:49:27', '2026-04-13 11:49:27'),
(3, 'Couture', 'Confection et retouches vestimentaires', 'scissors', 1, '2026-04-13 11:49:27', '2026-04-13 11:49:27'),
(4, 'Cuisine', 'Préparation de repas à domicile', 'utensils', 1, '2026-04-13 11:49:27', '2026-04-13 11:49:27'),
(5, 'Soutien scolaire', 'Aide aux devoirs et cours particuliers', 'book-open', 1, '2026-04-13 11:49:27', '2026-04-13 11:49:27'),
(6, 'Coiffure', 'Coiffure et soins capillaires à domicile', 'sparkles', 1, '2026-04-13 11:49:27', '2026-04-13 11:49:27'),
(7, 'Plomberie', 'Réparations et installations plomberie', 'wrench', 1, '2026-04-13 11:49:27', '2026-04-13 11:49:27'),
(8, 'Électricité', 'Dépannage et installations électriques', 'zap', 1, '2026-04-13 11:49:27', '2026-04-13 11:49:27');

-- --------------------------------------------------------

--
-- Structure de la table `failed_jobs`
--

CREATE TABLE `failed_jobs` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `uuid` varchar(255) NOT NULL,
  `connection` text NOT NULL,
  `queue` text NOT NULL,
  `payload` longtext NOT NULL,
  `exception` longtext NOT NULL,
  `failed_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Structure de la table `jobs`
--

CREATE TABLE `jobs` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `queue` varchar(255) NOT NULL,
  `payload` longtext NOT NULL,
  `attempts` tinyint(3) UNSIGNED NOT NULL,
  `reserved_at` int(10) UNSIGNED DEFAULT NULL,
  `available_at` int(10) UNSIGNED NOT NULL,
  `created_at` int(10) UNSIGNED NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Structure de la table `job_batches`
--

CREATE TABLE `job_batches` (
  `id` varchar(255) NOT NULL,
  `name` varchar(255) NOT NULL,
  `total_jobs` int(11) NOT NULL,
  `pending_jobs` int(11) NOT NULL,
  `failed_jobs` int(11) NOT NULL,
  `failed_job_ids` longtext NOT NULL,
  `options` mediumtext DEFAULT NULL,
  `cancelled_at` int(11) DEFAULT NULL,
  `created_at` int(11) NOT NULL,
  `finished_at` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Structure de la table `migrations`
--

CREATE TABLE `migrations` (
  `id` int(10) UNSIGNED NOT NULL,
  `migration` varchar(255) NOT NULL,
  `batch` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Déchargement des données de la table `migrations`
--

INSERT INTO `migrations` (`id`, `migration`, `batch`) VALUES
(1, '0001_01_01_000000_create_users_table', 1),
(2, '0001_01_01_000001_create_cache_table', 1),
(3, '0001_01_01_000002_create_jobs_table', 1),
(4, '2026_04_12_200001_create_profiles_table', 1),
(5, '2026_04_12_200002_create_categories_table', 1),
(6, '2026_04_12_200003_create_services_table', 1),
(7, '2026_04_12_200004_create_bookings_table', 1),
(8, '2026_04_12_200005_create_payments_table', 1),
(9, '2026_04_12_200006_create_notifications_table', 1),
(10, '2026_04_12_200456_create_personal_access_tokens_table', 1),
(11, '2026_04_13_100000_add_address_and_update_bookings', 1),
(12, '2026_04_13_200000_add_id_cards_and_ratings', 2),
(13, '2026_04_13_210000_add_photo_gender_dob_to_users', 3);

-- --------------------------------------------------------

--
-- Structure de la table `notifications_custom`
--

CREATE TABLE `notifications_custom` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `user_id` bigint(20) UNSIGNED NOT NULL,
  `type` enum('booking','payment','reminder','dispute','account') NOT NULL,
  `title` varchar(200) NOT NULL,
  `message` text NOT NULL,
  `read` tinyint(1) NOT NULL DEFAULT 0,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Déchargement des données de la table `notifications_custom`
--

INSERT INTO `notifications_custom` (`id`, `user_id`, `type`, `title`, `message`, `read`, `created_at`, `updated_at`) VALUES
(1, 6, 'booking', 'Nouvelle mission attribuée', 'L\'administrateur vous a attribué une mission pour « Couture traditionnelle ». Veuillez accepter ou refuser.', 1, '2026-04-13 12:22:18', '2026-04-13 13:55:36'),
(2, 3, 'booking', 'Prestataire trouvé', 'Un prestataire a été choisi pour votre demande « Couture traditionnelle ». En attente de sa confirmation.', 1, '2026-04-13 12:22:18', '2026-04-13 20:15:17'),
(3, 1, 'booking', 'Nouvelle demande de service', 'Admin NAFISSA a fait une demande pour « test ».', 1, '2026-04-13 12:29:39', '2026-04-13 12:32:10'),
(4, 6, 'booking', 'Nouvelle mission attribuée', 'L\'administrateur vous a attribué une mission pour « test ». Veuillez accepter ou refuser.', 1, '2026-04-13 12:58:06', '2026-04-13 16:12:04'),
(5, 1, 'booking', 'Prestataire trouvé', 'Un prestataire a été choisi pour votre demande « test ». En attente de sa confirmation.', 1, '2026-04-13 12:58:06', '2026-04-13 19:51:59'),
(6, 1, 'booking', 'Mission acceptée par le prestataire', 'Votre demande pour « test » a été acceptée. Veuillez procéder au paiement.', 1, '2026-04-13 12:59:06', '2026-04-13 19:52:01'),
(7, 3, 'booking', 'Mission acceptée par le prestataire', 'Votre demande pour « Couture traditionnelle » a été acceptée. Veuillez procéder au paiement.', 1, '2026-04-13 20:12:36', '2026-04-13 20:15:12'),
(8, 3, 'payment', 'Paiement confirmé', 'Votre paiement de 15000.00 FCFA pour « Couture traditionnelle » est sécurisé.', 1, '2026-04-13 20:15:35', '2026-04-13 20:16:06'),
(9, 6, 'payment', 'Paiement reçu (escrow)', 'Le paiement pour « Couture traditionnelle » est sécurisé en attente de validation.', 1, '2026-04-13 20:15:35', '2026-04-13 21:00:57'),
(10, 3, 'booking', 'Mission terminée', 'La mission pour « Couture traditionnelle » est terminée.', 1, '2026-04-13 20:16:26', '2026-04-14 09:29:18'),
(11, 6, 'booking', 'Mission terminée', 'La mission pour « Couture traditionnelle » est terminée.', 1, '2026-04-13 20:16:26', '2026-04-13 20:16:39'),
(12, 6, 'payment', 'Paiement libéré', 'Vous avez reçu 13500 FCFA pour « Couture traditionnelle ».', 1, '2026-04-13 20:20:24', '2026-04-13 21:00:57'),
(13, 6, 'booking', 'Nouvelle évaluation reçue', 'Aminata Ndiaye vous a attribué 5/5 pour « Couture traditionnelle ».', 1, '2026-04-13 20:20:35', '2026-04-13 21:00:57'),
(14, 1, 'booking', 'Nouvelle demande de service', 'Aminata Ndiaye a fait une demande pour « test ».', 1, '2026-04-13 20:35:44', '2026-04-13 20:42:41'),
(15, 6, 'booking', 'Nouvelle mission attribuée', 'L\'administrateur vous a attribué une mission pour « test ». Veuillez accepter ou refuser.', 1, '2026-04-13 20:38:10', '2026-04-13 21:00:57'),
(16, 3, 'booking', 'Prestataire trouvé', 'Un prestataire a été choisi pour votre demande « test ». En attente de sa confirmation.', 1, '2026-04-13 20:38:10', '2026-04-14 09:29:16'),
(17, 3, 'booking', 'Mission acceptée par le prestataire', 'Votre demande pour « test » a été acceptée. Veuillez procéder au paiement.', 1, '2026-04-13 20:38:42', '2026-04-14 09:29:15'),
(18, 3, 'payment', 'Paiement confirmé', 'Votre paiement de 25000.00 FCFA pour « test » est sécurisé.', 1, '2026-04-13 20:39:21', '2026-04-14 09:29:13'),
(19, 6, 'payment', 'Paiement reçu (escrow)', 'Le paiement pour « test » est sécurisé en attente de validation.', 1, '2026-04-13 20:39:21', '2026-04-13 21:00:57'),
(20, 3, 'booking', 'Mission terminée', 'La mission pour « test » est terminée.', 1, '2026-04-13 20:39:47', '2026-04-14 09:29:11'),
(21, 6, 'booking', 'Mission terminée', 'La mission pour « test » est terminée.', 1, '2026-04-13 20:39:47', '2026-04-13 21:00:57'),
(22, 6, 'payment', 'Paiement libéré', 'Vous avez reçu 22500 FCFA pour « test ».', 1, '2026-04-13 20:41:14', '2026-04-13 21:00:57'),
(23, 6, 'booking', 'Nouvelle évaluation reçue', 'Aminata Ndiaye vous a attribué 1/5 pour « test ».', 1, '2026-04-13 20:41:46', '2026-04-13 21:00:57'),
(24, 1, 'payment', 'Paiement confirmé', 'Votre paiement de 25000.00 FCFA pour « test » est sécurisé.', 1, '2026-04-13 20:59:26', '2026-04-13 20:59:38'),
(25, 6, 'payment', 'Paiement reçu (escrow)', 'Le paiement pour « test » est sécurisé en attente de validation.', 1, '2026-04-13 20:59:26', '2026-04-13 21:00:57'),
(26, 1, 'booking', 'Mission terminée', 'La mission pour « test » est terminée.', 1, '2026-04-13 21:00:00', '2026-04-14 09:25:17'),
(27, 6, 'booking', 'Mission terminée', 'La mission pour « test » est terminée.', 1, '2026-04-13 21:00:00', '2026-04-13 21:00:57'),
(28, 8, 'account', 'Compte suspendu', 'Votre compte a été suspendu par l\'administrateur.', 0, '2026-05-08 09:58:28', '2026-05-08 09:58:28'),
(29, 1, 'booking', 'Nouvelle demande de service', 'Fatima Ba a fait une demande pour « test ».', 1, '2026-05-08 17:26:38', '2026-05-08 17:27:04'),
(30, 6, 'booking', 'Nouvelle mission attribuée', 'L\'administrateur vous a attribué une mission pour « test ». Veuillez accepter ou refuser.', 0, '2026-05-08 17:28:07', '2026-05-08 17:28:07'),
(31, 2, 'booking', 'Prestataire trouvé', 'Un prestataire a été choisi pour votre demande « test ». En attente de sa confirmation.', 0, '2026-05-08 17:28:07', '2026-05-08 17:28:07'),
(32, 2, 'booking', 'Mission acceptée par le prestataire', 'Votre demande pour « test » a été acceptée. Veuillez procéder au paiement.', 0, '2026-05-08 17:29:10', '2026-05-08 17:29:10'),
(33, 2, 'payment', 'Paiement confirmé', 'Votre paiement de 25000.00 FCFA pour « test » est sécurisé.', 0, '2026-05-08 17:29:38', '2026-05-08 17:29:38'),
(34, 6, 'payment', 'Paiement reçu (escrow)', 'Le paiement pour « test » est sécurisé en attente de validation.', 0, '2026-05-08 17:29:38', '2026-05-08 17:29:38'),
(35, 2, 'booking', 'Mission terminée', 'La mission pour « test » est terminée.', 0, '2026-05-08 17:30:06', '2026-05-08 17:30:06'),
(36, 6, 'booking', 'Mission terminée', 'La mission pour « test » est terminée.', 0, '2026-05-08 17:30:06', '2026-05-08 17:30:06'),
(37, 6, 'payment', 'Paiement libéré', 'Vous avez reçu 22500 FCFA pour « test ».', 0, '2026-05-08 17:30:18', '2026-05-08 17:30:18'),
(38, 6, 'booking', 'Nouvelle évaluation reçue', 'Fatima Ba vous a attribué 5/5 pour « test ».', 0, '2026-05-08 17:30:30', '2026-05-08 17:30:30');

-- --------------------------------------------------------

--
-- Structure de la table `password_reset_tokens`
--

CREATE TABLE `password_reset_tokens` (
  `email` varchar(255) NOT NULL,
  `token` varchar(255) NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Structure de la table `payments`
--

CREATE TABLE `payments` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `booking_id` bigint(20) UNSIGNED NOT NULL,
  `amount` decimal(10,2) NOT NULL,
  `commission` decimal(10,2) NOT NULL DEFAULT 0.00,
  `method` enum('orange_money','wave','free_money','stripe') NOT NULL DEFAULT 'wave',
  `status` enum('pending','completed','refunded') NOT NULL DEFAULT 'pending',
  `escrow_status` enum('held','released','refunded') NOT NULL DEFAULT 'held',
  `transaction_ref` varchar(100) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Déchargement des données de la table `payments`
--

INSERT INTO `payments` (`id`, `booking_id`, `amount`, `commission`, `method`, `status`, `escrow_status`, `transaction_ref`, `created_at`, `updated_at`) VALUES
(1, 1, 5000.00, 500.00, 'wave', 'completed', 'released', 'NAF-WLYJKYBIMEJE-20260413', '2026-04-13 11:49:27', '2026-04-13 11:49:27'),
(2, 2, 15000.00, 1500.00, 'wave', 'completed', 'released', 'NAF-2V8D5JY1CCVF-20260413', '2026-04-13 20:15:35', '2026-04-13 20:20:24'),
(3, 4, 25000.00, 2500.00, 'wave', 'completed', 'released', 'NAF-V1Y1CJYNSIG5-20260413', '2026-04-13 20:39:21', '2026-04-13 20:41:14'),
(4, 3, 25000.00, 2500.00, 'wave', 'completed', 'held', 'NAF-C1TJCVFQTF5T-20260413', '2026-04-13 20:59:26', '2026-04-13 20:59:26'),
(5, 5, 25000.00, 2500.00, 'wave', 'completed', 'released', 'NAF-8PWPRFKPMFGM-20260508', '2026-05-08 17:29:38', '2026-05-08 17:30:18');

-- --------------------------------------------------------

--
-- Structure de la table `personal_access_tokens`
--

CREATE TABLE `personal_access_tokens` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `tokenable_type` varchar(255) NOT NULL,
  `tokenable_id` bigint(20) UNSIGNED NOT NULL,
  `name` text NOT NULL,
  `token` varchar(64) NOT NULL,
  `abilities` text DEFAULT NULL,
  `last_used_at` timestamp NULL DEFAULT NULL,
  `expires_at` timestamp NULL DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Déchargement des données de la table `personal_access_tokens`
--

INSERT INTO `personal_access_tokens` (`id`, `tokenable_type`, `tokenable_id`, `name`, `token`, `abilities`, `last_used_at`, `expires_at`, `created_at`, `updated_at`) VALUES
(17, 'App\\Models\\User', 3, 'auth-token', '198f06d6523b5a5620cf0c7f62012acce89e183f1d63b5145c1eb679b824c54b', '[\"*\"]', '2026-04-14 09:37:25', NULL, '2026-04-13 20:15:00', '2026-04-14 09:37:25'),
(23, 'App\\Models\\User', 2, 'auth-token', 'f44d9bbc04c71ff372729dd5355f5649d2d8ac2384cd2da66fb0fec0acebd812', '[\"*\"]', '2026-05-08 23:30:00', NULL, '2026-05-08 09:39:12', '2026-05-08 23:30:00'),
(24, 'App\\Models\\User', 4, 'auth-token', 'ed445131f27dc20a6ed8483377c69e7f963071fa2ba51904888df8efe27e42aa', '[\"*\"]', '2026-05-08 17:26:01', NULL, '2026-05-08 09:43:27', '2026-05-08 17:26:01'),
(25, 'App\\Models\\User', 6, 'auth-token', '3ae6a35aed5d42f3dabf002f5f7d24eae8a627cff3ac06dd83bfc871f45fa560', '[\"*\"]', '2026-05-08 21:52:07', NULL, '2026-05-08 17:28:53', '2026-05-08 21:52:07');

-- --------------------------------------------------------

--
-- Structure de la table `profiles`
--

CREATE TABLE `profiles` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `user_id` bigint(20) UNSIGNED NOT NULL,
  `bio` text DEFAULT NULL,
  `avatar` varchar(255) DEFAULT NULL,
  `location` varchar(200) DEFAULT NULL,
  `rating` decimal(2,1) NOT NULL DEFAULT 0.0,
  `documents` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`documents`)),
  `status` enum('pending','active','suspended') NOT NULL DEFAULT 'pending',
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Déchargement des données de la table `profiles`
--

INSERT INTO `profiles` (`id`, `user_id`, `bio`, `avatar`, `location`, `rating`, `documents`, `status`, `created_at`, `updated_at`) VALUES
(1, 1, NULL, NULL, 'Plateau, Dakar', 0.0, NULL, 'active', '2026-04-13 11:49:24', '2026-04-13 11:49:24'),
(2, 2, 'Maman de 2 enfants, résidente à Mermoz.', NULL, 'Mermoz, Dakar', 0.0, NULL, 'active', '2026-04-13 11:49:24', '2026-04-13 11:49:24'),
(3, 3, 'Maman de 3 enfants.', NULL, 'Sacré-Cœur, Dakar', 0.0, NULL, 'active', '2026-04-13 11:49:25', '2026-04-13 11:49:25'),
(4, 4, 'Étudiant en informatique à l\'UCAD. Sérieux et ponctuel.', NULL, 'Fann, Dakar', 4.5, NULL, 'active', '2026-04-13 11:49:25', '2026-04-13 11:49:25'),
(5, 5, 'Étudiant en génie civil. Disponible les week-ends.', NULL, 'Parcelles Assainies, Dakar', 4.2, NULL, 'active', '2026-04-13 11:49:25', '2026-04-13 11:49:25'),
(6, 6, 'Couturière professionnelle. 10 ans d\'expérience.', NULL, 'Médina, Dakar', 3.7, NULL, 'active', '2026-04-13 11:49:26', '2026-05-08 17:30:30'),
(7, 7, 'Coiffeuse et spécialiste en soins capillaires.', NULL, 'Grand Yoff, Dakar', 4.6, NULL, 'active', '2026-04-13 11:49:26', '2026-04-13 11:49:26'),
(8, 8, NULL, NULL, 'Guédiawaye, Dakar', 0.0, NULL, 'suspended', '2026-04-13 11:49:27', '2026-05-08 09:58:28');

-- --------------------------------------------------------

--
-- Structure de la table `services`
--

CREATE TABLE `services` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `provider_id` bigint(20) UNSIGNED NOT NULL,
  `category_id` bigint(20) UNSIGNED NOT NULL,
  `title` varchar(200) NOT NULL,
  `description` text DEFAULT NULL,
  `price` decimal(10,2) NOT NULL,
  `location` varchar(200) DEFAULT NULL,
  `available` tinyint(1) NOT NULL DEFAULT 1,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Déchargement des données de la table `services`
--

INSERT INTO `services` (`id`, `provider_id`, `category_id`, `title`, `description`, `price`, `location`, `available`, `created_at`, `updated_at`) VALUES
(1, 4, 5, 'Soutien scolaire mathématiques', 'Cours de maths pour primaire et collège. Patient et pédagogue. Déplacement à domicile dans tout Dakar.', 5000.00, 'Fann, Dakar', 1, '2026-04-13 11:49:27', '2026-04-13 11:49:27'),
(2, 4, 2, 'Garde d\'enfants en soirée', 'Baby-sitting le soir et week-end. Expérience de 2 ans avec des familles dakaroises.', 3000.00, 'Fann, Dakar', 1, '2026-04-13 11:49:27', '2026-04-13 11:49:27'),
(3, 5, 1, 'Ménage complet appartement', 'Nettoyage approfondi maison ou appartement. Matériel fourni.', 7500.00, 'Parcelles Assainies, Dakar', 1, '2026-04-13 11:49:27', '2026-04-13 11:49:27'),
(4, 5, 7, 'Dépannage plomberie', 'Réparation fuites, installation robinetterie. Intervention rapide.', 10000.00, 'Parcelles Assainies, Dakar', 1, '2026-04-13 11:49:27', '2026-04-13 11:49:27'),
(5, 6, 3, 'Couture traditionnelle', 'Confection boubous, robes et tenues traditionnelles sénégalaises. Tissus wax et bazin.', 15000.00, 'Médina, Dakar', 1, '2026-04-13 11:49:27', '2026-04-13 11:49:27'),
(6, 6, 4, 'Cuisine sénégalaise à domicile', 'Préparation de thiéboudienne, yassa, mafé et autres plats sénégalais.', 8000.00, 'Médina, Dakar', 1, '2026-04-13 11:49:27', '2026-04-13 11:49:27'),
(7, 7, 6, 'Coiffure à domicile', 'Tresses, tissages et coiffures modernes. Spécialiste cheveux afro.', 5000.00, 'Grand Yoff, Dakar', 1, '2026-04-13 11:49:27', '2026-04-13 11:49:27'),
(8, 7, 6, 'Soins capillaires naturels', 'Soins nourrissants, masques et traitements pour cheveux abîmés.', 4000.00, 'Grand Yoff, Dakar', 1, '2026-04-13 11:49:27', '2026-04-13 11:49:27'),
(9, 6, 7, 'test', 'test', 25000.00, 'Fann, Dakar', 1, '2026-04-13 12:17:46', '2026-04-13 12:17:46');

-- --------------------------------------------------------

--
-- Structure de la table `sessions`
--

CREATE TABLE `sessions` (
  `id` varchar(255) NOT NULL,
  `user_id` bigint(20) UNSIGNED DEFAULT NULL,
  `ip_address` varchar(45) DEFAULT NULL,
  `user_agent` text DEFAULT NULL,
  `payload` longtext NOT NULL,
  `last_activity` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Déchargement des données de la table `sessions`
--

INSERT INTO `sessions` (`id`, `user_id`, `ip_address`, `user_agent`, `payload`, `last_activity`) VALUES
('9bOEDd46rKzHukvkVcQ3hRf1B3SSemZABLMpe1EZ', 4, '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36', 'eyJfdG9rZW4iOiJOaE16NE9LZXZHNnNzUGVVTGRPNkxMdjU1dHlaTVYxWnJheE00QnBEIiwibG9naW5fd2ViXzU5YmEzNmFkZGMyYjJmOTQwMTU4MGYwMTRjN2Y1OGVhNGUzMDk4OWQiOjQsIl9mbGFzaCI6eyJvbGQiOltdLCJuZXciOltdfSwicGFzc3dvcmRfaGFzaF93ZWIiOiI0OTdiMTc0N2E2YjBmNmFiZjAzMjUxNzlmOGM0ZTdmOWQzYTM5MzI4NzgxY2I1ZWM1YmUxMzE3ZjE2NDQ5NjU1IiwiX3ByZXZpb3VzIjp7InVybCI6Imh0dHA6XC9cLzEyNy4wLjAuMTo4MDAwXC9hcGlcL215LXNlcnZpY2VzIiwicm91dGUiOm51bGx9fQ==', 1776159580),
('H3qoyp9PliZKQajaNnPm5aaDZ0C7UclHSZmcv80v', 3, '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36', 'eyJfdG9rZW4iOiJpbUJ2OHFOY09zQURSSG4xeXNEbXhMZXg2WGNha2tySU51MTRxS21EIiwiX3ByZXZpb3VzIjp7InVybCI6Imh0dHA6XC9cLzEyNy4wLjAuMTo4MDAwXC9hcGlcL3BheW1lbnRzXC9oaXN0b3J5P3Blcl9wYWdlPTEiLCJyb3V0ZSI6bnVsbH0sIl9mbGFzaCI6eyJvbGQiOltdLCJuZXciOltdfX0=', 1776158909),
('hAdOEQXIU4DgVidbpspxi9G4MEXpg6nAZx5jLBOE', NULL, '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36', 'eyJfdG9rZW4iOiJqT0VkeGN4NXVFbjk5SlRraTJRNm91N25IS2lTSWZibXVuaE5lMXJRIiwiX3ByZXZpb3VzIjp7InVybCI6Imh0dHA6XC9cLzEyNy4wLjAuMTo4MDAwXC9hcGlcL3NlcnZpY2VzP3BhZ2U9MSZzb3J0X2J5PWNyZWF0ZWRfYXQiLCJyb3V0ZSI6bnVsbH0sIl9mbGFzaCI6eyJvbGQiOltdLCJuZXciOltdfX0=', 1776159449),
('TU9xiJ7xAABEDY73R2Cqw2h1igp03w7yo0wrbNS9', 1, '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36', 'eyJfdG9rZW4iOiIySjlhMWZjYjdLdXZZcHA2Rm9zS1hVWWtGRFZZaDJCeDhRellXMk4wIiwibG9naW5fd2ViXzU5YmEzNmFkZGMyYjJmOTQwMTU4MGYwMTRjN2Y1OGVhNGUzMDk4OWQiOjEsIl9mbGFzaCI6eyJvbGQiOltdLCJuZXciOltdfSwicGFzc3dvcmRfaGFzaF93ZWIiOiI1MTljYjI3OGZjODdkY2RlODM2YmU3MWI5YmNkYjY2NjhlYmMzZDhhODRmMGRkMzc1MDI2N2U5YTQ1MDY4YjhhIiwiX3ByZXZpb3VzIjp7InVybCI6Imh0dHA6XC9cLzEyNy4wLjAuMTo4MDAwXC9hcGlcL2Jvb2tpbmdzP3Blcl9wYWdlPTUiLCJyb3V0ZSI6bnVsbH19', 1776163644);

-- --------------------------------------------------------

--
-- Structure de la table `users`
--

CREATE TABLE `users` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `name` varchar(255) NOT NULL,
  `email` varchar(255) NOT NULL,
  `phone` varchar(20) DEFAULT NULL,
  `address` varchar(255) DEFAULT NULL,
  `photo` varchar(255) DEFAULT NULL,
  `gender` enum('homme','femme') DEFAULT NULL,
  `date_of_birth` date DEFAULT NULL,
  `id_card_recto` varchar(255) DEFAULT NULL,
  `id_card_verso` varchar(255) DEFAULT NULL,
  `role` enum('maman','etudiant','artisan','admin') NOT NULL DEFAULT 'maman',
  `verified` tinyint(1) NOT NULL DEFAULT 0,
  `email_verified_at` timestamp NULL DEFAULT NULL,
  `password` varchar(255) NOT NULL,
  `remember_token` varchar(100) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Déchargement des données de la table `users`
--

INSERT INTO `users` (`id`, `name`, `email`, `phone`, `address`, `photo`, `gender`, `date_of_birth`, `id_card_recto`, `id_card_verso`, `role`, `verified`, `email_verified_at`, `password`, `remember_token`, `created_at`, `updated_at`) VALUES
(1, 'Admin NAFISSA', 'admin@nafissa.com', '+221 77 378 48 14', 'Plateau, Dakar', NULL, NULL, NULL, NULL, NULL, 'admin', 1, NULL, '$2y$12$ag6mXu96Ba8.7rqP5kADL.LcxbVyup75qoWs1iOiOBZ/U/KtA8CKS', NULL, '2026-04-13 11:49:24', '2026-04-13 19:51:27'),
(2, 'Fatima Ba', 'fatima@nafissa.com', '+221 77 111 11 11', 'Mermoz, Dakar', NULL, NULL, NULL, NULL, NULL, 'maman', 1, NULL, '$2y$12$hwVUgu1UJ9K7llWvIhiQneqFZhlt1xMQj7JNOVhb1ernpdzzM6KN6', NULL, '2026-04-13 11:49:24', '2026-04-13 11:49:24'),
(3, 'Aminata Ndiaye', 'aminata@nafissa.com', '+221 78 222 22 22', 'Sacré-Cœur, Dakar', NULL, NULL, NULL, NULL, NULL, 'maman', 1, NULL, '$2y$12$ICohdS7Mi6KxxCG.Hz.EWuBVj1qVCR3fIWC6xwJhYrGw86JZJf0aK', NULL, '2026-04-13 11:49:25', '2026-04-13 11:49:25'),
(4, 'Oumar Sy', 'oumar@nafissa.com', '+221 76 333 33 33', 'Fann, Dakar', NULL, NULL, NULL, NULL, NULL, 'etudiant', 1, NULL, '$2y$12$qNrPRZ7pTcw1VB2M0m/h0uh2K43BV3yphdTVI.DmMj/IkSGUAxSQK', NULL, '2026-04-13 11:49:25', '2026-04-13 11:49:25'),
(5, 'Ibrahima Diop', 'ibrahima@nafissa.com', '+221 77 555 55 55', 'Parcelles Assainies, Dakar', NULL, NULL, NULL, NULL, NULL, 'etudiant', 1, NULL, '$2y$12$voogMY/OiePWGrm5xQLCtuA.dx4abQ0Vt7IdC1PFJd18.C/dAqsju', NULL, '2026-04-13 11:49:25', '2026-04-13 11:49:25'),
(6, 'Aissata Diallo', 'aissata@nafissa.com', '+221 78 444 44 44', 'Médina, Dakar', NULL, NULL, NULL, NULL, NULL, 'artisan', 1, NULL, '$2y$12$4xqkUgg45TV0CAXtnfVoX.hbzWEjQdFRp1l085/mOcNzo1wA4yVby', NULL, '2026-04-13 11:49:26', '2026-04-13 11:49:26'),
(7, 'Mariama Sow', 'mariama@nafissa.com', '+221 76 666 66 66', 'Grand Yoff, Dakar', NULL, NULL, NULL, NULL, NULL, 'artisan', 1, NULL, '$2y$12$EhhluFedCqwEYDWzdbAV7OmVnVWgrw7NU1gHJR.U.B/JcWfWUAexm', NULL, '2026-04-13 11:49:26', '2026-04-13 11:49:26'),
(8, 'Moussa Fall', 'moussa@nafissa.com', '+221 77 777 77 77', 'Guédiawaye, Dakar', NULL, NULL, NULL, NULL, NULL, 'etudiant', 0, NULL, '$2y$12$BNsGQCzyUPulhzjsNadI2u1oIxD/rCOHDuuheh5Mp8kwqag1tChsC', NULL, '2026-04-13 11:49:27', '2026-04-13 11:49:27');

--
-- Index pour les tables déchargées
--

--
-- Index pour la table `bookings`
--
ALTER TABLE `bookings`
  ADD PRIMARY KEY (`id`),
  ADD KEY `bookings_client_id_foreign` (`client_id`),
  ADD KEY `bookings_provider_id_foreign` (`provider_id`),
  ADD KEY `bookings_service_id_foreign` (`service_id`);

--
-- Index pour la table `cache`
--
ALTER TABLE `cache`
  ADD PRIMARY KEY (`key`),
  ADD KEY `cache_expiration_index` (`expiration`);

--
-- Index pour la table `cache_locks`
--
ALTER TABLE `cache_locks`
  ADD PRIMARY KEY (`key`),
  ADD KEY `cache_locks_expiration_index` (`expiration`);

--
-- Index pour la table `categories`
--
ALTER TABLE `categories`
  ADD PRIMARY KEY (`id`);

--
-- Index pour la table `failed_jobs`
--
ALTER TABLE `failed_jobs`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `failed_jobs_uuid_unique` (`uuid`);

--
-- Index pour la table `jobs`
--
ALTER TABLE `jobs`
  ADD PRIMARY KEY (`id`),
  ADD KEY `jobs_queue_index` (`queue`);

--
-- Index pour la table `job_batches`
--
ALTER TABLE `job_batches`
  ADD PRIMARY KEY (`id`);

--
-- Index pour la table `migrations`
--
ALTER TABLE `migrations`
  ADD PRIMARY KEY (`id`);

--
-- Index pour la table `notifications_custom`
--
ALTER TABLE `notifications_custom`
  ADD PRIMARY KEY (`id`),
  ADD KEY `notifications_custom_user_id_foreign` (`user_id`);

--
-- Index pour la table `password_reset_tokens`
--
ALTER TABLE `password_reset_tokens`
  ADD PRIMARY KEY (`email`);

--
-- Index pour la table `payments`
--
ALTER TABLE `payments`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `payments_transaction_ref_unique` (`transaction_ref`),
  ADD KEY `payments_booking_id_foreign` (`booking_id`);

--
-- Index pour la table `personal_access_tokens`
--
ALTER TABLE `personal_access_tokens`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `personal_access_tokens_token_unique` (`token`),
  ADD KEY `personal_access_tokens_tokenable_type_tokenable_id_index` (`tokenable_type`,`tokenable_id`),
  ADD KEY `personal_access_tokens_expires_at_index` (`expires_at`);

--
-- Index pour la table `profiles`
--
ALTER TABLE `profiles`
  ADD PRIMARY KEY (`id`),
  ADD KEY `profiles_user_id_foreign` (`user_id`);

--
-- Index pour la table `services`
--
ALTER TABLE `services`
  ADD PRIMARY KEY (`id`),
  ADD KEY `services_provider_id_foreign` (`provider_id`),
  ADD KEY `services_category_id_foreign` (`category_id`);

--
-- Index pour la table `sessions`
--
ALTER TABLE `sessions`
  ADD PRIMARY KEY (`id`),
  ADD KEY `sessions_user_id_index` (`user_id`),
  ADD KEY `sessions_last_activity_index` (`last_activity`);

--
-- Index pour la table `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `users_email_unique` (`email`);

--
-- AUTO_INCREMENT pour les tables déchargées
--

--
-- AUTO_INCREMENT pour la table `bookings`
--
ALTER TABLE `bookings`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;

--
-- AUTO_INCREMENT pour la table `categories`
--
ALTER TABLE `categories`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=9;

--
-- AUTO_INCREMENT pour la table `failed_jobs`
--
ALTER TABLE `failed_jobs`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT pour la table `jobs`
--
ALTER TABLE `jobs`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT pour la table `migrations`
--
ALTER TABLE `migrations`
  MODIFY `id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=14;

--
-- AUTO_INCREMENT pour la table `notifications_custom`
--
ALTER TABLE `notifications_custom`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=39;

--
-- AUTO_INCREMENT pour la table `payments`
--
ALTER TABLE `payments`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;

--
-- AUTO_INCREMENT pour la table `personal_access_tokens`
--
ALTER TABLE `personal_access_tokens`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=26;

--
-- AUTO_INCREMENT pour la table `profiles`
--
ALTER TABLE `profiles`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=9;

--
-- AUTO_INCREMENT pour la table `services`
--
ALTER TABLE `services`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=10;

--
-- AUTO_INCREMENT pour la table `users`
--
ALTER TABLE `users`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=9;

--
-- Contraintes pour les tables déchargées
--

--
-- Contraintes pour la table `bookings`
--
ALTER TABLE `bookings`
  ADD CONSTRAINT `bookings_client_id_foreign` FOREIGN KEY (`client_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `bookings_provider_id_foreign` FOREIGN KEY (`provider_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `bookings_service_id_foreign` FOREIGN KEY (`service_id`) REFERENCES `services` (`id`) ON DELETE CASCADE;

--
-- Contraintes pour la table `notifications_custom`
--
ALTER TABLE `notifications_custom`
  ADD CONSTRAINT `notifications_custom_user_id_foreign` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;

--
-- Contraintes pour la table `payments`
--
ALTER TABLE `payments`
  ADD CONSTRAINT `payments_booking_id_foreign` FOREIGN KEY (`booking_id`) REFERENCES `bookings` (`id`) ON DELETE CASCADE;

--
-- Contraintes pour la table `profiles`
--
ALTER TABLE `profiles`
  ADD CONSTRAINT `profiles_user_id_foreign` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;

--
-- Contraintes pour la table `services`
--
ALTER TABLE `services`
  ADD CONSTRAINT `services_category_id_foreign` FOREIGN KEY (`category_id`) REFERENCES `categories` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `services_provider_id_foreign` FOREIGN KEY (`provider_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
