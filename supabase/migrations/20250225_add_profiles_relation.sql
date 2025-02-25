-- profiles.idへの外部キー制約を追加
ALTER TABLE articles
DROP CONSTRAINT IF EXISTS articles_user_id_fkey;

ALTER TABLE articles
ADD CONSTRAINT articles_user_id_fkey
FOREIGN KEY (user_id) REFERENCES profiles (id);
