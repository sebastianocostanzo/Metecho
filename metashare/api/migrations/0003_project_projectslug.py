# Generated by Django 2.2.3 on 2019-08-02 21:18

import django.db.models.deletion
import hashid_field.field
import sfdo_template_helpers.fields.markdown
import sfdo_template_helpers.slugs
from django.db import migrations, models

ALPHABET = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ1234567890"


class Migration(migrations.Migration):

    dependencies = [("api", "0002_githubrepository_product_productslug")]

    operations = [
        migrations.CreateModel(
            name="Project",
            fields=[
                (
                    "id",
                    hashid_field.field.HashidAutoField(
                        alphabet=ALPHABET,
                        min_length=7,
                        primary_key=True,
                        serialize=False,
                    ),
                ),
                ("created_at", models.DateTimeField(auto_now_add=True)),
                ("edited_at", models.DateTimeField(auto_now=True)),
                ("name", models.CharField(max_length=50)),
                (
                    "description",
                    sfdo_template_helpers.fields.markdown.MarkdownField(
                        blank=True, property_suffix="_markdown"
                    ),
                ),
                ("branch_name", models.SlugField()),
            ],
            options={"ordering": ("-created_at", "name")},
            bases=(sfdo_template_helpers.slugs.SlugMixin, models.Model),
        ),
        migrations.AlterModelOptions(name="product", options={"ordering": ("name",)}),
        migrations.CreateModel(
            name="ProjectSlug",
            fields=[
                (
                    "id",
                    models.AutoField(
                        auto_created=True,
                        primary_key=True,
                        serialize=False,
                        verbose_name="ID",
                    ),
                ),
                ("slug", models.SlugField(unique=True)),
                (
                    "is_active",
                    models.BooleanField(
                        default=True,
                        help_text=(
                            "If multiple slugs are active, we will default to the most "
                            "recent."
                        ),
                    ),
                ),
                ("created_at", models.DateTimeField(auto_now_add=True)),
                (
                    "parent",
                    models.ForeignKey(
                        on_delete=django.db.models.deletion.PROTECT,
                        related_name="slugs",
                        to="api.Project",
                    ),
                ),
            ],
            options={"ordering": ("-created_at",), "abstract": False},
        ),
        migrations.AddField(
            model_name="project",
            name="product",
            field=models.ForeignKey(
                on_delete=django.db.models.deletion.PROTECT,
                related_name="projects",
                to="api.Product",
            ),
        ),
        migrations.AlterUniqueTogether(
            name="project",
            unique_together={("name", "product"), ("branch_name", "product")},
        ),
    ]
