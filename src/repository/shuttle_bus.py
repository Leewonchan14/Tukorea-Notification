from sqlalchemy.orm import Session

from src.model.shuttle_bus import ShuttleBusElement, ShuttleBus


def find_by_url(db: Session, shuttle_bus_url: str):
    return db.query(ShuttleBus).filter(ShuttleBus.url.is_(shuttle_bus_url)).first()


def save(db: Session, shuttle_bus_element: ShuttleBusElement) -> ShuttleBus:
    db_shuttle_bus = shuttle_bus_element.to_shuttle_bus()
    db.add(db_shuttle_bus)
    db.commit()

    return db_shuttle_bus
