-- Path convention:
-- team_id/project_id/user_id/filename

create policy "owner can upload own files"
  on storage.objects for insert
  with check (
    bucket_id = 'project-files'
    and (storage.foldername(name))[3] = auth.uid()::text
  );

create policy "owner can read own files"
  on storage.objects for select
  using (
    bucket_id = 'project-files'
    and (storage.foldername(name))[3] = auth.uid()::text
  );

create policy "project members can read shared files"
  on storage.objects for select
  using (
    bucket_id = 'project-files'
    and exists (
      select 1 from documents d
      where d.storage_path = name
        and d.visibility = 'SHARED'
        and is_project_member(d.project_id)
    )
  );
