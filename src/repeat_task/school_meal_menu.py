import logging

from sqlalchemy.orm import Session

import src.repository.school_meal_menu as crud
from src.crawler import Crawler
from src.model.school_meal_menu import SchoolMealMenuElement
from src.notification import Notification


def school_meal_menu_repeat_task(
        logger: logging.Logger,
        db: Session,
        crawler: Crawler,
        notification: Notification,
):
    # 학식 메뉴 이미지들을 가져온다.
    img_elements = SchoolMealMenuElement.get_school_meal_menu_img_elements(crawler)

    logger.debug(f"크롤링한 학식 메뉴 이미지 갯수 : {str(len(img_elements))}")

    for school_meal_menu_element in img_elements:
        # 만약 데이터베이스에 이미 존재하는 학식 메뉴 이미지라면 넘어간다.
        if crud.find_by_url(db, school_meal_menu_element.get_url()):
            continue

        # 새로운 학식 메뉴 이미지를 저장한다.
        db_school_meal_menu = crud.save(db, school_meal_menu_element)
        # 새로운 학식 메뉴 이미지가 저장되었음을 디스코드에 알린다.
        logger.debug(f"새로운 학식 메뉴 이미지가 저장되었습니다: {db_school_meal_menu.place}")

        # 새로운 학식 메뉴 이미지가 저장되었음을 디스코드에 알린다.
        notification.send_new_school_meal_menu_message(db_school_meal_menu.to_message())
