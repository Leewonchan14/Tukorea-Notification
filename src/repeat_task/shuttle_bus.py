import logging

from sqlalchemy.orm import Session

import src.repository.shuttle_bus as crud
from src.crawler import Crawler
from src.model.shuttle_bus import ShuttleBusElement
from src.notification import Notification


def shuttle_bus_repeat_task(
        logger: logging.Logger,
        db: Session,
        crawler: Crawler,
        notification: Notification,
):
    # 셔틀 시간표 이미지들을 가져온다.
    img_elements = ShuttleBusElement.get_shuttle_bus_img_elements(crawler)

    logger.debug(f"크롤링한 셔틀 시간표 이미지 갯수 : {str(len(img_elements))}")

    for shuttle_bus_element in img_elements:
        # 만약 데이터베이스에 이미 존재하는 셔틀 시간표 이미지라면 넘어간다.
        if crud.find_by_url(db, shuttle_bus_element.get_url()):
            continue

        # 새로운 셔틀 시간표 이미지를 저장한다.
        db_shuttle_bus = crud.save(db, shuttle_bus_element)

        # 새로운 셔틀 시간표 이미지가 저장되었음을 디스코드에 알린다.
        logger.debug(f"새로운 셔틀 시간표 이미지가 저장되었습니다: {db_shuttle_bus.place}")

        notification.send_new_shuttle_bus_message(db_shuttle_bus.to_message())
