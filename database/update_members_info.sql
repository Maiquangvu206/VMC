USE `vmc_portal`;

-- 1. Bổ sung Gen 7
INSERT INTO `Generations` (`id`, `name`, `years`, `description`)
VALUES ('gen-7', 'Gen 7', '2026-2027', 'Thế hệ Gen 7 (2026 - 2027)')
ON DUPLICATE KEY UPDATE `years` = VALUES(`years`), `description` = VALUES(`description`);

-- 2. Cập nhật Thế hệ Gen 1 (Ban Cố Vấn)
UPDATE `Members` SET `term` = 'Gen 1', `dob` = '18/01', `department` = 'Ban Cố Vấn', `role_title` = 'Cựu Trưởng ban Sản Xuất' WHERE `member_code` = 'VMC-6334';
UPDATE `Members` SET `term` = 'Gen 1', `dob` = '20/03', `department` = 'Ban Cố Vấn', `role_title` = 'Cựu Trưởng ban Nhân Sự' WHERE `member_code` = 'VMC-8795';
UPDATE `Members` SET `term` = 'Gen 1', `dob` = '06/01', `department` = 'Ban Cố Vấn', `role_title` = 'Cựu Thành viên Đối Ngoại' WHERE `member_code` = 'VMC-4222';
UPDATE `Members` SET `term` = 'Gen 1', `dob` = '22/07', `department` = 'Ban Cố Vấn', `role_title` = 'Cựu Thành viên Nhân Sự' WHERE `member_code` = 'VMC-1909';
UPDATE `Members` SET `term` = 'Gen 1', `dob` = '27/07', `department` = 'Ban Cố Vấn', `role_title` = 'Cựu Thành viên Nội Dung' WHERE `member_code` = 'VMC-6690';
UPDATE `Members` SET `term` = 'Gen 1', `dob` = '02/08', `department` = 'Ban Cố Vấn', `role_title` = 'Cựu Chủ nhiệm/ Người sáng lập' WHERE `member_code` = 'VMC-2845';
UPDATE `Members` SET `term` = 'Gen 1', `dob` = '03/11', `department` = 'Ban Cố Vấn', `role_title` = 'Cựu Thành viên Nội Dung' WHERE `member_code` = 'VMC-4026';
UPDATE `Members` SET `term` = 'Gen 1', `dob` = '10/11', `department` = 'Ban Cố Vấn', `role_title` = 'Cựu Trưởng ban Nhân Sự' WHERE `member_code` = 'VMC-2021';
UPDATE `Members` SET `term` = 'Gen 1', `dob` = '18/11', `department` = 'Ban Cố Vấn', `role_title` = 'Cựu Thành viên Truyền Thông' WHERE `member_code` = 'VMC-1511';
UPDATE `Members` SET `term` = 'Gen 1', `dob` = '25/11', `department` = 'Ban Cố Vấn', `role_title` = 'Cựu Thành viên Nội Dung' WHERE `member_code` = 'VMC-1821';
UPDATE `Members` SET `term` = 'Gen 1', `dob` = '08/12', `department` = 'Ban Cố Vấn', `role_title` = 'Cựu Phó Chủ Nhiệm/Trưởng ban Truyền Thông' WHERE `member_code` = 'VMC-5311';

-- 3. Cập nhật Thế hệ Gen 2 (Ban Cố Vấn)
UPDATE `Members` SET `term` = 'Gen 2', `dob` = '19/01', `department` = 'Ban Cố Vấn', `role_title` = 'Cựu Trưởng ban Sản Xuất' WHERE `member_code` = 'VMC-7689';
UPDATE `Members` SET `term` = 'Gen 2', `dob` = '27/09', `department` = 'Ban Cố Vấn', `role_title` = 'Cựu Trưởng ban Truyền Thông' WHERE `member_code` = 'VMC-7104';
UPDATE `Members` SET `term` = 'Gen 2', `dob` = '04/12', `department` = 'Ban Cố Vấn', `role_title` = 'Cựu Chủ Nhiệm' WHERE `member_code` = 'VMC-8007';
UPDATE `Members` SET `term` = 'Gen 2', `dob` = '12/12', `department` = 'Ban Cố Vấn', `role_title` = 'Cựu Phó chủ nhiệm/Trưởng ban Nội dung' WHERE `member_code` = 'VMC-8350';

-- 4. Cập nhật Thế hệ Gen 3 (Ban Cố Vấn)
UPDATE `Members` SET `term` = 'Gen 3', `dob` = '23/02', `department` = 'Ban Cố Vấn', `role_title` = 'Cựu Thành viên Đối Ngoại - Nhân Sự' WHERE `member_code` = 'VMC-9820';
UPDATE `Members` SET `term` = 'Gen 3', `dob` = '21/05', `department` = 'Ban Cố Vấn', `role_title` = 'Cựu Trưởng ban Nội Dung' WHERE `member_code` = 'VMC-9653';
UPDATE `Members` SET `term` = 'Gen 3', `dob` = '06/06', `department` = 'Ban Cố Vấn', `role_title` = 'Cựu Thành viên Nội Dung' WHERE `member_code` = 'VMC-2382';
UPDATE `Members` SET `term` = 'Gen 3', `dob` = '08/06', `department` = 'Ban Cố Vấn', `role_title` = 'Cựu Trưởng ban Sản Xuất' WHERE `member_code` = 'VMC-5060';
UPDATE `Members` SET `term` = 'Gen 3', `dob` = '09/06', `department` = 'Ban Cố Vấn', `role_title` = 'Cựu Thành viên Sản Xuất' WHERE `member_code` = 'VMC-8936';
UPDATE `Members` SET `term` = 'Gen 3', `dob` = '10/06', `department` = 'Ban Cố Vấn', `role_title` = 'Cựu Phó Chủ nhiệm/Trưởng ban Đối Ngoại - Nhân Sự' WHERE `member_code` = 'VMC-5815';
UPDATE `Members` SET `term` = 'Gen 3', `dob` = '29/07', `department` = 'Ban Cố Vấn', `role_title` = 'Cựu Trưởng ban Truyền Thông' WHERE `member_code` = 'VMC-5844';
UPDATE `Members` SET `term` = 'Gen 3', `dob` = '31/08', `department` = 'Ban Cố Vấn', `role_title` = 'Cựu Thành viên Truyền Thông' WHERE `member_code` = 'VMC-9768';
UPDATE `Members` SET `term` = 'Gen 3', `dob` = '20/11', `department` = 'Ban Cố Vấn', `role_title` = 'Cựu Trưởng ban Đối Ngoại - Nhân Sự' WHERE `member_code` = 'VMC-7003';
UPDATE `Members` SET `term` = 'Gen 3', `dob` = '03/12', `department` = 'Ban Cố Vấn', `role_title` = 'Cựu Phó ban Truyền Thông' WHERE `member_code` = 'VMC-3471';
UPDATE `Members` SET `term` = 'Gen 3', `dob` = '24/12', `department` = 'Ban Cố Vấn', `role_title` = 'Cựu Chủ nhiệm/Trưởng ban Phát Thanh' WHERE `member_code` = 'VMC-1179';

-- 5. Cập nhật Thế hệ Gen 4 (Ban Cố Vấn)
UPDATE `Members` SET `term` = 'Gen 4', `dob` = '26/10', `department` = 'Ban Cố Vấn', `role_title` = 'Cựu Chủ nhiệm' WHERE `member_code` = 'VMC-1937';
UPDATE `Members` SET `term` = 'Gen 4', `dob` = '16/01', `department` = 'Ban Cố Vấn', `role_title` = 'Cựu Phó chủ nhiệm/Trưởng ban Nội dung' WHERE `member_code` = 'VMC-6506';
UPDATE `Members` SET `term` = 'Gen 4', `dob` = '28/03', `department` = 'Ban Cố Vấn', `role_title` = 'Cựu Trưởng ban Sản Xuất' WHERE `member_code` = 'VMC-6287';
UPDATE `Members` SET `term` = 'Gen 4', `dob` = '23/02', `department` = 'Ban Cố Vấn', `role_title` = 'Cựu Trưởng ban Truyền Thông' WHERE `member_code` = 'VMC-6530';
UPDATE `Members` SET `term` = 'Gen 4', `dob` = '15/02', `department` = 'Ban Cố Vấn', `role_title` = 'Cựu Trưởng ban Đối Ngoại - Nhân Sự' WHERE `member_code` = 'VMC-8534';
UPDATE `Members` SET `term` = 'Gen 4', `dob` = '08/06', `department` = 'Ban Cố Vấn', `role_title` = 'Cựu Phó ban Nội Dung' WHERE `member_code` = 'VMC-5309';
UPDATE `Members` SET `term` = 'Gen 4', `dob` = '10/06', `department` = 'Ban Cố Vấn', `role_title` = 'Cựu Thành viên Nội Dung' WHERE `member_code` = 'VMC-4678';
UPDATE `Members` SET `term` = 'Gen 4', `dob` = '07/11', `department` = 'Ban Cố Vấn', `role_title` = 'Cựu Phó chủ nhiệm/Trưởng ban Đối ngoại' WHERE `member_code` = 'VMC-5717';

-- 6. Cập nhật Thế hệ Gen 5 (Ban Cố Vấn)
UPDATE `Members` SET `term` = 'Gen 5', `dob` = '30/06', `department` = 'Ban Cố Vấn', `role_title` = 'Cựu Trưởng ban Nhân Sự' WHERE `member_code` = 'VMC-1276';
UPDATE `Members` SET `term` = 'Gen 5', `dob` = '29/07', `department` = 'Ban Cố Vấn', `role_title` = 'Cựu Phó ban Truyền Thông' WHERE `member_code` = 'VMC-8096';
UPDATE `Members` SET `term` = 'Gen 5', `dob` = '21/11', `department` = 'Ban Cố Vấn', `role_title` = 'Cựu Phó Chủ nhiệm' WHERE `member_code` = 'VMC-8385';
UPDATE `Members` SET `term` = 'Gen 5', `dob` = '08/06', `department` = 'Ban Cố Vấn', `role_title` = 'Cựu Phó Chủ Nhiệm/Trưởng ban Nội dung' WHERE `member_code` = 'VMC-3422';
UPDATE `Members` SET `term` = 'Gen 5', `dob` = '28/03', `department` = 'Ban Cố Vấn', `role_title` = 'Cựu Trưởng ban Phát Thanh' WHERE `member_code` = 'VMC-7710';

-- 7. Cập nhật Thế hệ Gen 6 (Ban Cố Vấn & Ban Chủ Nhiệm)
UPDATE `Members` SET `term` = 'Gen 6', `dob` = '29/09', `department` = 'Ban Cố Vấn', `role_title` = 'Cựu Thành viên Đối Ngoại - Nhân Sự' WHERE `member_code` = 'VMC-1933';
UPDATE `Members` SET `term` = 'Gen 6', `dob` = '17/11', `department` = 'Ban Cố Vấn', `role_title` = 'Cựu Trưởng ban Đối Ngoại - Nhân Sự' WHERE `member_code` = 'VMC-1989';
UPDATE `Members` SET `term` = 'Gen 6', `dob` = '09/07', `department` = 'Ban Cố Vấn', `role_title` = 'Cựu Thành viên Truyền Thông' WHERE `member_code` = 'VMC-3135';
UPDATE `Members` SET `term` = 'Gen 6', `dob` = '27/02', `department` = 'Ban Chủ Nhiệm', `role_title` = 'Chủ Nhiệm' WHERE `member_code` = 'VMC-5623';
UPDATE `Members` SET `term` = 'Gen 6', `dob` = '15/08', `department` = 'Ban Cố Vấn', `role_title` = 'Cựu Thành viên Truyền Thông' WHERE `member_code` = 'VMC-3131';
UPDATE `Members` SET `term` = 'Gen 6', `dob` = '26/10', `department` = 'Ban Cố Vấn', `role_title` = 'Cựu Thành viên Sản Xuất' WHERE `member_code` = 'VMC-7930';
UPDATE `Members` SET `term` = 'Gen 6', `dob` = '02/09', `department` = 'Ban Cố Vấn', `role_title` = 'Cựu Thành viên Sản Xuất', `full_name` = 'Phạm Khánh Ly' WHERE `member_code` = 'VMC-9000';
UPDATE `Members` SET `term` = 'Gen 6', `dob` = '11/08', `department` = 'Ban Cố Vấn', `role_title` = 'Cựu Thành viên Sản Xuất' WHERE `member_code` = 'VMC-9805';
UPDATE `Members` SET `term` = 'Gen 6', `dob` = '15/11', `department` = 'Ban Cố Vấn', `role_title` = 'Cựu Thành viên Sản Xuất' WHERE `member_code` = 'VMC-5536';
UPDATE `Members` SET `term` = 'Gen 6', `dob` = '08/10', `department` = 'Ban Cố Vấn', `role_title` = 'Cựu Thành viên Sản Xuất' WHERE `member_code` = 'VMC-6683';
UPDATE `Members` SET `term` = 'Gen 6', `dob` = '03/01', `department` = 'Ban Cố Vấn', `role_title` = 'Cựu Phó Chủ Nhiệm' WHERE `member_code` = 'VMC-8526';
UPDATE `Members` SET `term` = 'Gen 6', `dob` = '24/11', `department` = 'Ban Cố Vấn', `role_title` = 'Cựu Phó Chủ Nhiệm' WHERE `member_code` = 'VMC-9239';
UPDATE `Members` SET `term` = 'Gen 6', `dob` = '24/01', `department` = 'Ban Cố Vấn', `role_title` = 'Cựu Chủ Nhiệm' WHERE `member_code` = 'VMC-1972';
UPDATE `Members` SET `term` = 'Gen 6', `dob` = '16/06', `department` = 'Ban Cố Vấn', `role_title` = 'Cựu Thành viên Đối Ngoại - Nhân Sự' WHERE `member_code` = 'VMC-6360';
UPDATE `Members` SET `term` = 'Gen 6', `dob` = '30/10', `department` = 'Ban Chủ Nhiệm', `role_title` = 'Phó Chủ Nhiệm' WHERE `member_code` = 'VMC-8809';
UPDATE `Members` SET `term` = 'Gen 6', `dob` = '02/11', `department` = 'Ban Cố Vấn', `role_title` = 'Cựu Thành viên Nội Dung' WHERE `member_code` = 'VMC-7681';
UPDATE `Members` SET `term` = 'Gen 6', `dob` = '21/04', `department` = 'Ban Cố Vấn', `role_title` = 'Cựu Thành viên Nội Dung' WHERE `member_code` = 'VMC-4686';

-- 8. Cập nhật Thế hệ Gen 7
UPDATE `Members` SET `term` = 'Gen 7', `dob` = '12/04', `department` = 'Ban Đối Ngoại - Nhân Sự', `role_title` = 'Phó Ban Đối Ngoại - Nhân Sự' WHERE `member_code` = 'VMC-4948';
UPDATE `Members` SET `term` = 'Gen 7', `dob` = '20/01', `department` = 'Ban Chủ Nhiệm', `role_title` = 'Phó Chủ Nhiệm / Trưởng Ban Đối Ngoại - Nhân Sự' WHERE `member_code` = 'VMC-1057';
UPDATE `Members` SET `term` = 'Gen 7', `dob` = '08/05', `department` = 'Ban Nội Dung', `role_title` = 'Phó Ban Nội Dung' WHERE `member_code` = 'VMC-3445';
UPDATE `Members` SET `term` = 'Gen 7', `dob` = '13/04', `department` = 'Ban Đối Ngoại - Nhân Sự', `role_title` = 'Phó Ban Đối Ngoại - Nhân Sự' WHERE `member_code` = 'VMC-1397';
UPDATE `Members` SET `term` = 'Gen 7', `dob` = '28/03', `department` = 'Ban Nội Dung', `role_title` = 'Phó Ban Nội Dung' WHERE `member_code` = 'VMC-1038';
UPDATE `Members` SET `term` = 'Gen 7', `dob` = '06/01', `department` = 'Ban Sản Xuất', `role_title` = 'Trưởng Ban Sản Xuất' WHERE `member_code` = 'VMC-1518';
UPDATE `Members` SET `term` = 'Gen 7', `dob` = '01/07', `department` = 'Ban Cố Vấn', `role_title` = 'Cựu Thành viên Sản Xuất' WHERE `member_code` = 'VMC-4648';
UPDATE `Members` SET `term` = 'Gen 7', `dob` = '29/07', `department` = 'Ban Nội Dung', `role_title` = 'Trưởng Ban Nội Dung' WHERE `member_code` = 'VMC-8444';
UPDATE `Members` SET `term` = 'Gen 7', `dob` = '03/06', `department` = 'Ban Cố Vấn', `role_title` = 'Cựu Thành viên Nội Dung' WHERE `member_code` = 'VMC-7647';
UPDATE `Members` SET `term` = 'Gen 7', `dob` = '18/06', `department` = 'Ban Cố Vấn', `role_title` = 'Cựu Thành viên Nội Dung' WHERE `member_code` = 'VMC-3061';
UPDATE `Members` SET `term` = 'Gen 7', `dob` = NULL, `department` = 'Ban Sản Xuất', `role_title` = 'Phó Ban Sản Xuất' WHERE `member_code` = 'VMC-9753';
