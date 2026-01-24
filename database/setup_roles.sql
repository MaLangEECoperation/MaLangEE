-- 유저 생성 (이미 존재하면 에러 없이 넘어감)
-- WARNING: This is a sample file. Change the password below!
DO
$do$
BEGIN
   IF NOT EXISTS (
      SELECT FROM pg_catalog.pg_roles
      WHERE  rolname = 'aimaster') THEN

      CREATE ROLE aimaster WITH LOGIN PASSWORD 'aimaster123' CREATEDB;
      RAISE NOTICE 'Role "aimaster" created with DEFAULT password. Please change it!';
   ELSE
      RAISE NOTICE 'Role "aimaster" already exists.';
   END IF;
END
$do$;

-- 권한 부여 (필요 시)
ALTER USER aimaster WITH SUPERUSER; -- 개발 편의상 슈퍼유저 부여 (선택사항)
