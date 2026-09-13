-- Server-side guard for guided-intake eye photos: the client normalises every
-- capture to a ≤1600 px JPEG, so anything else is not from our flow.
update storage.buckets
set file_size_limit = 5242880,          -- 5 MB
    allowed_mime_types = array['image/jpeg']
where id = 'intake-photos';
