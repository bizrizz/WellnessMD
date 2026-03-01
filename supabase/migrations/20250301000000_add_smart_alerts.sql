-- Add smart_alerts_enabled to profiles for push notification preference
alter table profiles add column if not exists smart_alerts_enabled boolean default true;
