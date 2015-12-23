from flask import Flask, render_template
from flask.ext.sqlalchemy import SQLAlchemy
from flask.ext.script import Manager
from flask.ext.migrate import Migrate, MigrateCommand
from flask.ext.restless import APIManager

app = Flask(__name__)
app.debug = True

app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///app.db'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = True

db = SQLAlchemy(app)
migrate = Migrate(app, db)

manager = Manager(app)
manager.add_command('db', MigrateCommand)

api_manager = APIManager(app, flask_sqlalchemy_db=db)


class History(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(255))
    priority = db.Column(db.Integer)
    status = db.Column(db.Integer)

    @property
    def timing(self):
        result = 0
        for issue in self.issues:
            result += issue.timing
        return result


class Issue(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(255))
    timing = db.Column(db.Integer)
    priority = db.Column(db.Integer)
    status = db.Column(db.Integer)
    history = db.relationship('History',
                              backref=db.backref('issues', lazy='dynamic'))
    history_id = db.Column(db.Integer, db.ForeignKey('history.id'))


history_blueprint = api_manager.create_api(History,
                                           methods=['GET', 'POST', 'PUT', 'DELETE'],
                                           include_methods=['timing'])
issues_blueprint = api_manager.create_api(Issue, methods=['GET', 'POST', 'PUT', 'DELETE'])


@app.route('/')
def index():
    return render_template('index.html')


if __name__ == '__main__':
    manager.run()