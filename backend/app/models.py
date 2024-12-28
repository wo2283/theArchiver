# app/models.py

from . import db

# Association tables for many-to-many relationships
problem_tags = db.Table('problem_tags',
    db.Column('problem_id', db.Integer, db.ForeignKey('problems.id'), primary_key=True),
    db.Column('tag_id', db.Integer, db.ForeignKey('tags.id'), primary_key=True)
)

problem_sources = db.Table('problem_sources',
    db.Column('problem_id', db.Integer, db.ForeignKey('problems.id'), primary_key=True),
    db.Column('source_id', db.Integer, db.ForeignKey('sources.id'), primary_key=True)
)

class Tag(db.Model):
    __tablename__ = 'tags'
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(64), unique=True, nullable=False)

    problems = db.relationship('Problem', secondary=problem_tags, back_populates='tags')

    def to_dict(self):
        return {
            'id': self.id,
            'name': self.name
        }

class Source(db.Model):
    __tablename__ = 'sources'
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(128), unique=True, nullable=False)

    problems = db.relationship('Problem', secondary=problem_sources, back_populates='sources')

    def to_dict(self):
        return {
            'id': self.id,
            'name': self.name
        }

class Problem(db.Model):
    __tablename__ = 'problems'
    id = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.String(256), nullable=False)
    difficulty = db.Column(db.String(16), nullable=False)
    estimated_time = db.Column(db.String(64))
    keywords = db.Column(db.String(256))  # Comma-separated keywords
    author = db.Column(db.String(128))
    solution_text = db.Column(db.Text)
    status = db.Column(db.String(32), default='Unsolved')
    latex_content = db.Column(db.Text)

    tags = db.relationship('Tag', secondary=problem_tags, back_populates='problems')
    sources = db.relationship('Source', secondary=problem_sources, back_populates='problems')

    def to_dict(self):
        return {
            'id': self.id,
            'title': self.title,
            'difficulty': self.difficulty,
            'estimated_time': self.estimated_time,
            'keywords': [kw.strip() for kw in self.keywords.split(',')] if self.keywords else [],
            'author': self.author,
            'solution_text': self.solution_text,
            'status': self.status,
            'latex_content': self.latex_content,
            'tags': [tag.to_dict() for tag in self.tags],
            'sources': [source.to_dict() for source in self.sources]
        }
