# Generated by Django 3.0.2 on 2020-01-06 17:44

import django.contrib.postgres.fields.jsonb
from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ("api", "0045_repository_branch_name"),
    ]

    operations = [
        migrations.AddField(
            model_name="project",
            name="github_users",
            field=django.contrib.postgres.fields.jsonb.JSONField(
                blank=True, default=list
            ),
        ),
        migrations.AddField(
            model_name="repository",
            name="github_users",
            field=django.contrib.postgres.fields.jsonb.JSONField(
                blank=True, default=list
            ),
        ),
    ]