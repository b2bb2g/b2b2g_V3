-- 업로드 서버측 하드닝(5.7-B 안전 규칙). 버킷에 용량·허용 MIME 를 지정하면 Storage 가 강제한다.
-- 위험 타입(image/svg+xml·text/html·js·실행파일 등)은 허용목록에서 제외해 XSS·악성업로드 차단.

-- 제품 이미지: 5MB, 래스터 이미지만.
update storage.buckets
set
  file_size_limit = 5242880,
  allowed_mime_types = array['image/jpeg', 'image/png', 'image/webp', 'image/gif']
where id = 'product-media';

-- 게시판 첨부: 50MB, 이미지·동영상·문서(PDF·오피스·텍스트·zip). svg/html/js 제외.
update storage.buckets
set
  file_size_limit = 52428800,
  allowed_mime_types = array[
    'image/jpeg', 'image/png', 'image/webp', 'image/gif',
    'video/mp4', 'video/webm', 'video/quicktime',
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'application/vnd.ms-powerpoint',
    'application/vnd.openxmlformats-officedocument.presentationml.presentation',
    'text/plain',
    'application/zip'
  ]
where id = 'board-media';
