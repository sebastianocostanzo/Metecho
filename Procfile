web: yarn django:serve:prod
worker: python manage.py rqworker default
worker-short: honcho start -f Procfile_worker_short
release: python manage.py migrate --noinput
