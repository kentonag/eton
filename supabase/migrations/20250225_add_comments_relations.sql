-- commentsテーブルの外部キー制約を追加
ALTER TABLE comments
DROP CONSTRAINT IF EXISTS comments_user_id_fkey;

ALTER TABLE comments
ADD CONSTRAINT comments_user_id_fkey
FOREIGN KEY (user_id) REFERENCES profiles (id);

ALTER TABLE comments
DROP CONSTRAINT IF EXISTS comments_article_id_fkey;

ALTER TABLE comments
ADD CONSTRAINT comments_article_id_fkey
FOREIGN KEY (article_id) REFERENCES articles (id);
