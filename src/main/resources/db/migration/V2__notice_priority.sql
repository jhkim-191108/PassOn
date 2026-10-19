alter table notices add column priority varchar(20);

update notices
set priority = case when important then 'IMPORTANT' else 'NORMAL' end
where priority is null;

alter table notices alter column priority set not null;

alter table notices drop column important;
