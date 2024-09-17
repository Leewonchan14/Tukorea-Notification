from sqlalchemy.orm import Session

from src.model.school_meal_menu import SchoolMealMenu, SchoolMealMenuElement


def find_by_url(db: Session, school_meal_menu_url: str):
    return db.query(SchoolMealMenu).filter(SchoolMealMenu.url.is_(school_meal_menu_url)).first()


def save(db: Session, school_meal_menu_element: SchoolMealMenuElement) -> SchoolMealMenu:
    db_school_meal_menu = school_meal_menu_element.to_school_meal_menu()
    db.add(db_school_meal_menu)
    db.commit()

    return db_school_meal_menu
