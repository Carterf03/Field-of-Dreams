-- --------------------------------------------------------
-- Host:                         localhost
-- Server version:               11.7.2-MariaDB-ubu2404 - mariadb.org binary distribution
-- Server OS:                    debian-linux-gnu
-- HeidiSQL Version:             12.10.0.7000
-- --------------------------------------------------------

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET NAMES utf8 */;
/*!50503 SET NAMES utf8mb4 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

-- Dumping data for table fieldofdreams.coach: ~2 rows (approximately)
INSERT INTO `coach` (`coach_id`, `coach_full_name`, `coach_email`, `coach_avatar`, `coach_code`, `coach_salt`, `coach_password`) VALUES
	(1, 'Jane Doe', 'jadoe@ncsu.edu', 'https://robohash.org/veniamdoloresenim.png', 'ABCDEF', '48c8947f69c054a5caa934674ce8881d02bb18fb59d5a63eeaddff735b0e9', '83d9bdb5e20f3571b087db9aabf190a296741c3e864d7742f35658cfccc1b79c4599aad25084aa9a28c649a50c92244227b3e53e197621301d619d1ea01873c4'),
	(2, 'Longname Coachman', 'unreasonablylongemail@ncsu.edu', 'https://robohash.org/longnamecoach.png', '123456', 'jh3gd987xnhhotbclnsjkznj9n834m4nnl5umi4v2z5wb8uokv7ny6p101x1', '644d40f3c509918e343e868ecf1d0c563fe00495295894092c1d3cddb720e64fc8b0b7592e5cb78e26c50981f664e4dc5666c51d5ffc97a10aa2ab49d438a2e9');

-- Dumping data for table fieldofdreams.coach_play: ~4 rows (approximately)
INSERT INTO `coach_play` (`cps_coach_id`, `cps_play_id`) VALUES
	(1, 1),
	(1, 2),
	(1, 3),
	(2, 4);

-- Dumping data for table fieldofdreams.frame: ~0 rows (approximately)

-- Dumping data for table fieldofdreams.frame_object: ~0 rows (approximately)

-- Dumping data for table fieldofdreams.object: ~0 rows (approximately)

-- Dumping data for table fieldofdreams.play: ~4 rows (approximately)
INSERT INTO `play` (`play_id`, `play_title`, `play_preview`) VALUES
	(1, 'Play 1', 'images/fakepreview.png'),
	(2, 'Play 2', 'images/fakepreview.png'),
	(3, 'Play 3', 'images/fakepreview.png'),
	(4, 'New Play', 'images/fakepreview.png');

-- Dumping data for table fieldofdreams.player: ~2 rows (approximately)
INSERT INTO `player` (`player_id`, `player_full_name`, `player_email`, `player_avatar`, `player_salt`, `player_password`) VALUES
	(1, 'John Smith', 'jasmith@ncsu.edu', 'https://robohash.org/nullaautemin.png', '801e87294783281ae49fc8287a0fd86779b27d7972d3e84f0fa0d826d7cb67dfefc', 'e289219c34f9a32ebc82393f09719b7f34872de95463242b5ffe8bb4b11a5fe7d454f9f5d082c8207c5d69b220ba06624b4bb15ffa05cc7d7d53c43f9e96da6a'),
	(2, 'Floaty NoCoach', 'floaty@ncsu.edu', 'https://robohash.org/nocoach.png', 'ok7q6v93bayr2x8m0kgotzh8help6i5murg2n8l23zt2p6vngrsfsgfsfelw', '4003838c9602bc84a80f9342dfe191790ea9ffbf6fc1a8866a39193cf16078fe6088551fafe4fb58687478c471bb97179119cd218b6dcb848a4c2e04b85cf431');

-- Dumping data for table fieldofdreams.player_coach: ~2 rows (approximately)
INSERT INTO `player_coach` (`pcs_player_id`, `pcs_coach_id`) VALUES
	(1, 1),
	(1, 2);

-- Dumping data for table fieldofdreams.play_frame: ~0 rows (approximately)

/*!40103 SET TIME_ZONE=IFNULL(@OLD_TIME_ZONE, 'system') */;
/*!40101 SET SQL_MODE=IFNULL(@OLD_SQL_MODE, '') */;
/*!40014 SET FOREIGN_KEY_CHECKS=IFNULL(@OLD_FOREIGN_KEY_CHECKS, 1) */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40111 SET SQL_NOTES=IFNULL(@OLD_SQL_NOTES, 1) */;
