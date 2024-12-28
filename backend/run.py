# run.py

from app import create_app, db
from app.models import Tag, Source, Problem

app = create_app()

# Optional: Shell context for Flask CLI
@app.shell_context_processor
def make_shell_context():
    return {'db': db, 'Tag': Tag, 'Source': Source, 'Problem': Problem}

if __name__ == '__main__':
    app.run(debug=True, host='localhost', port=5000)
