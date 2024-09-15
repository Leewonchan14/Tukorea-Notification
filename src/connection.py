import databases
import sqlalchemy
from sqlalchemy.orm import sessionmaker

DATABASE_URL = 'sqlite:///article.db'
database = databases.Database(DATABASE_URL)


metadata = sqlalchemy.MetaData()

article = sqlalchemy.Table(
    'article',
    metadata,
    sqlalchemy.Column('id', sqlalchemy.Integer, primary_key=True),
    sqlalchemy.Column('writer', sqlalchemy.String(100)),
    sqlalchemy.Column('title', sqlalchemy.Text),
    sqlalchemy.Column('url', sqlalchemy.Text)
)

engine = sqlalchemy.create_engine(
    DATABASE_URL, connect_args={"check_same_thread": False}
)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
