# app/routes.py

from flask import Blueprint, request, jsonify, current_app
from .models import db, Tag, Source, Problem
from PIL import Image, ImageOps
import pytesseract
from transformers import pipeline

api_bp = Blueprint('api', __name__)

# -------------------
# Tag Endpoints
# -------------------

@api_bp.route('/tags/', methods=['GET', 'POST', 'PUT', 'DELETE'])
def manage_tags():
    if request.method == 'GET':
        tags = Tag.query.all()
        return jsonify([tag.to_dict() for tag in tags]), 200

    elif request.method == 'POST':
        data = request.get_json()
        if not data or 'name' not in data:
            return jsonify({'error': 'Tag name is required'}), 400
        name = data['name'].strip()
        if Tag.query.filter_by(name=name).first():
            return jsonify({'error': 'Tag already exists'}), 400
        new_tag = Tag(name=name)
        try:
            db.session.add(new_tag)
            db.session.commit()
            return jsonify(new_tag.to_dict()), 201
        except Exception as e:
            db.session.rollback()
            current_app.logger.error(f"Error creating tag: {e}")
            return jsonify({'error': 'Failed to create tag', 'details': str(e)}), 500

    elif request.method == 'PUT':
        data = request.get_json()
        if not data or 'id' not in data or 'name' not in data:
            return jsonify({'error': 'Tag ID and new name are required'}), 400
        tag = Tag.query.get(data['id'])
        if not tag:
            return jsonify({'error': 'Tag not found'}), 404
        new_name = data['name'].strip()
        if Tag.query.filter(Tag.name == new_name, Tag.id != data['id']).first():
            return jsonify({'error': 'Another tag with this name already exists'}), 400
        tag.name = new_name
        try:
            db.session.commit()
            return jsonify(tag.to_dict()), 200
        except Exception as e:
            db.session.rollback()
            current_app.logger.error(f"Error updating tag: {e}")
            return jsonify({'error': 'Failed to update tag', 'details': str(e)}), 500

    elif request.method == 'DELETE':
        data = request.get_json()
        if not data or 'id' not in data:
            return jsonify({'error': 'Tag ID is required'}), 400
        tag = Tag.query.get(data['id'])
        if not tag:
            return jsonify({'error': 'Tag not found'}), 404
        try:
            db.session.delete(tag)
            db.session.commit()
            return jsonify({'message': 'Tag deleted successfully'}), 200
        except Exception as e:
            db.session.rollback()
            current_app.logger.error(f"Error deleting tag: {e}")
            return jsonify({'error': 'Failed to delete tag', 'details': str(e)}), 500

# -------------------
# Source Endpoints
# -------------------

@api_bp.route('/sources/', methods=['GET', 'POST', 'PUT', 'DELETE'])
def manage_sources():
    if request.method == 'GET':
        sources = Source.query.all()
        return jsonify([source.to_dict() for source in sources]), 200

    elif request.method == 'POST':
        data = request.get_json()
        if not data or 'name' not in data:
            return jsonify({'error': 'Source name is required'}), 400
        name = data['name'].strip()
        if Source.query.filter_by(name=name).first():
            return jsonify({'error': 'Source already exists'}), 400
        new_source = Source(name=name)
        try:
            db.session.add(new_source)
            db.session.commit()
            return jsonify(new_source.to_dict()), 201
        except Exception as e:
            db.session.rollback()
            current_app.logger.error(f"Error creating source: {e}")
            return jsonify({'error': 'Failed to create source', 'details': str(e)}), 500

    elif request.method == 'PUT':
        data = request.get_json()
        if not data or 'id' not in data or 'name' not in data:
            return jsonify({'error': 'Source ID and new name are required'}), 400
        source = Source.query.get(data['id'])
        if not source:
            return jsonify({'error': 'Source not found'}), 404
        new_name = data['name'].strip()
        if Source.query.filter(Source.name == new_name, Source.id != data['id']).first():
            return jsonify({'error': 'Another source with this name already exists'}), 400
        source.name = new_name
        try:
            db.session.commit()
            return jsonify(source.to_dict()), 200
        except Exception as e:
            db.session.rollback()
            current_app.logger.error(f"Error updating source: {e}")
            return jsonify({'error': 'Failed to update source', 'details': str(e)}), 500

    elif request.method == 'DELETE':
        data = request.get_json()
        if not data or 'id' not in data:
            return jsonify({'error': 'Source ID is required'}), 400
        source = Source.query.get(data['id'])
        if not source:
            return jsonify({'error': 'Source not found'}), 404
        try:
            db.session.delete(source)
            db.session.commit()
            return jsonify({'message': 'Source deleted successfully'}), 200
        except Exception as e:
            db.session.rollback()
            current_app.logger.error(f"Error deleting source: {e}")
            return jsonify({'error': 'Failed to delete source', 'details': str(e)}), 500

# -------------------
# Problem Endpoints
# -------------------

@api_bp.route('/problems/', methods=['GET', 'POST'])
def manage_problems():
    if request.method == 'GET':
        problems = Problem.query.all()
        return jsonify([problem.to_dict() for problem in problems]), 200

    elif request.method == 'POST':
        data = request.get_json()
        required_fields = ['title', 'difficulty']
        for field in required_fields:
            if field not in data or not data[field].strip():
                return jsonify({'error': f'{field} is required'}), 400

        # Extract and sanitize fields
        title = data['title'].strip()
        difficulty = data['difficulty'].strip()
        estimated_time = data.get('estimated_time', '').strip()
        keywords = ', '.join([kw.strip() for kw in data.get('keywords', []) if kw.strip()])
        author = data.get('author', '').strip()
        solution_text = data.get('solution_text', '').strip()
        status = data.get('status', 'Unsolved').strip()
        latex_content = data.get('latex_content', '').strip()

        # Fetch or create tags
        tag_names = [tag.strip() for tag in data.get('tags', []) if tag.strip()]
        tags = []
        for name in tag_names:
            tag = Tag.query.filter_by(name=name).first()
            if not tag:
                tag = Tag(name=name)
                db.session.add(tag)
            tags.append(tag)

        # Fetch or create sources
        source_names = [source.strip() for source in data.get('sources', []) if source.strip()]
        sources = []
        for name in source_names:
            source = Source.query.filter_by(name=name).first()
            if not source:
                source = Source(name=name)
                db.session.add(source)
            sources.append(source)

        # Create new problem
        new_problem = Problem(
            title=title,
            difficulty=difficulty,
            estimated_time=estimated_time,
            keywords=keywords,
            author=author,
            solution_text=solution_text,
            status=status,
            latex_content=latex_content,
            tags=tags,
            sources=sources
        )

        try:
            db.session.add(new_problem)
            db.session.commit()
            return jsonify(new_problem.to_dict()), 201
        except Exception as e:
            db.session.rollback()
            current_app.logger.error(f"Error creating problem: {e}")
            return jsonify({'error': 'Failed to create problem', 'details': str(e)}), 500

@api_bp.route('/problems/<int:problem_id>', methods=['GET', 'PUT', 'DELETE'])
def handle_problem(problem_id):
    problem = Problem.query.get(problem_id)
    if not problem:
        return jsonify({'error': 'Problem not found'}), 404

    if request.method == 'GET':
        return jsonify(problem.to_dict()), 200

    elif request.method == 'PUT':
        data = request.get_json()
        if not data:
            return jsonify({'error': 'No data provided'}), 400

        title = data.get('title', problem.title).strip()
        difficulty = data.get('difficulty', problem.difficulty).strip()
        estimated_time = data.get('estimated_time', problem.estimated_time).strip()
        keywords = ', '.join([kw.strip() for kw in data.get('keywords', []) if kw.strip()])
        author = data.get('author', problem.author).strip()
        solution_text = data.get('solution_text', problem.solution_text).strip()
        status = data.get('status', problem.status).strip()
        latex_content = data.get('latex_content', problem.latex_content).strip()

        # Fetch or create tags
        tag_names = [tag.strip() for tag in data.get('tags', []) if tag.strip()]
        tags = []
        for name in tag_names:
            tag = Tag.query.filter_by(name=name).first()
            if not tag:
                tag = Tag(name=name)
                db.session.add(tag)
            tags.append(tag)

        # Fetch or create sources
        source_names = [source.strip() for source in data.get('sources', []) if source.strip()]
        sources = []
        for name in source_names:
            source = Source.query.filter_by(name=name).first()
            if not source:
                source = Source(name=name)
                db.session.add(source)
            sources.append(source)

        # Update problem fields
        problem.title = title
        problem.difficulty = difficulty
        problem.estimated_time = estimated_time
        problem.keywords = keywords
        problem.author = author
        problem.solution_text = solution_text
        problem.status = status
        problem.latex_content = latex_content
        problem.tags = tags
        problem.sources = sources

        try:
            db.session.commit()
            return jsonify(problem.to_dict()), 200
        except Exception as e:
            db.session.rollback()
            current_app.logger.error(f"Error updating problem: {e}")
            return jsonify({'error': 'Failed to update problem', 'details': str(e)}), 500

    elif request.method == 'DELETE':
        try:
            db.session.delete(problem)
            db.session.commit()
            return jsonify({'message': 'Problem deleted successfully'}), 200
        except Exception as e:
            db.session.rollback()
            current_app.logger.error(f"Error deleting problem: {e}")
            return jsonify({'error': 'Failed to delete problem', 'details': str(e)}), 500

# -------------------
# Problem Upload Endpoint
# -------------------

@api_bp.route('/upload_problem/', methods=['POST'])
def upload_problem():
    if 'image' not in request.files:
        return jsonify({'error': 'No image part in the request'}), 400

    file = request.files['image']

    if file.filename == '':
        return jsonify({'error': 'No selected file'}), 400

    if file:
        try:
            # Open the image file
            image = Image.open(file.stream)

            # Preprocess the image for better OCR accuracy
            image = image.convert('L')  # Convert to grayscale
            image = ImageOps.invert(image)  # Invert colors
            image = image.point(lambda x: 0 if x < 128 else 255, '1')  # Thresholding
            basewidth = 800
            wpercent = (basewidth / float(image.size[0]))
            hsize = int((float(image.size[1]) * float(wpercent)))
            image = image.resize((basewidth, hsize), Image.ANTIALIAS)

            # Perform OCR using Tesseract
            extracted_text = pytesseract.image_to_string(image)

            # Initialize the LLM pipeline
            generator = pipeline('text-generation', model='EleutherAI/gpt-neo-2.7B')

            # Prompt the model to convert extracted text to LaTeX
            prompt = (
                "Convert the following problem statement into LaTeX format:\n\n"
                f"{extracted_text}\n\n"
                "LaTeX Format:"
            )

            # Generate LaTeX using the model
            generated = generator(prompt, max_length=500, num_return_sequences=1)
            latex_text = generated[0]['generated_text'].split("LaTeX Format:")[-1].strip()

            # Create a new problem entry
            new_problem = Problem(
                title="Converted Problem",
                difficulty="Medium",  # You might need additional processing to determine this
                estimated_time="20 minutes",
                keywords="Converted, OCR, LaTeX",
                author="Automated System",
                solution_text="",  # Optionally, handle solution extraction similarly
                status="Unsolved",
                latex_content=latex_text,
                tags=[],    # Optionally, assign default tags or extract from text
                sources=[]  # Optionally, assign default sources or extract from text
            )

            db.session.add(new_problem)
            db.session.commit()

            return jsonify(new_problem.to_dict()), 201

        except Exception as e:
            current_app.logger.error(f"Error processing uploaded image: {e}")
            return jsonify({'error': 'Failed to process the image', 'details': str(e)}), 500
