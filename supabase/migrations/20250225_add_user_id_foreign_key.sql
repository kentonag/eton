-- profiles テーブルの user_id を auth.users の id への外部キーとして設定
ALTER TABLE profiles
ADD CONSTRAINT profiles_user_id_fkey
FOREIGN KEY (user_id) REFERENCES auth.users(id)
ON DELETE CASCADE;

-- articles テーブルの user_id を profiles の user_id への外部キーとして設定
ALTER TABLE articles
ADD CONSTRAINT articles_user_id_fkey
FOREIGN KEY (user_id) REFERENCES profiles(user_id)
ON DELETE CASCADE;
