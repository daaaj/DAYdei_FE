import add from "date-fns/add";
import Cookies from "js-cookie";
import format from "date-fns/format";
import styled from "styled-components";
import getDate from "date-fns/getDate";
import { useLocation } from "react-router";
import { getYear, getMonth } from "date-fns";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import interactionPlugin from "@fullcalendar/interaction";
import { alertState } from "../../../redux/modules/alertReducer";
import { __getTotalPosts, __getPostDetail, __updateDragPost } from "../../../redux/modules/calendarSlice";
import AddPostModal from "./AddPostModal";
import DetailPostModal from "./DetailPostModal";
import CalendarSidebar from "./CalendarSidebar";
import DayScheduleModal from "./DayScheduleModal";
import OtherUserCalendar from "./OtherUserCalendar";
import { GetUserInfo } from "../../../utils/cookie/userInfo";
import ColorFromDB from "../../../utils/calendar/CalendarBasic";
import defaultImg from "../../../assets/defaultImage/profile.jpg";

function CalendarMain({ ...props }) {
  // 일정 추가 모달창 open state
  const [isAddPost, setIsAddPost] = useState(false);
  // 수정하기 state
  const [isSubmit, setIsSubmit] = useState(false);
  // 일정 추가 버튼 여부(로그인한 유저 캘린더 / 타 유저 캘린더)
  const [disabled, setDisabled] = useState(false);
  const [newData, setNewData] = useState("");
  // 날짜 클릭시 일정추가모달 뜨고 startDate 해당 클릭 날짜로
  const [pickDate, setPickDate] = useState("");
  const [modifyPostId, setModifyPostId] = useState("");
  // 타유저 업데이트/공유한 일정 클릭시 postId
  const [otherCalendarPostId, setOtherCalendarPostId] = useState("");
  // 하루 일정 모달창 state
  const [isTodaySchedule, setIsTodaySchedule] = useState(false);
  // 하루 일정 -> 디테일 시 하루일정 다시 띄우기
  const [againToday, setAgainToday] = useState(false);
  const [moreDate, setMoreDate] = useState("");
  // 타유저 캘린더 share 일정 state
  const [otherCalendarState, setOtherCalendarState] = useState(false);
  // memo side open 여부
  const [isSideOpen, setIsSideOpen] = useState(true);
  // othercalendar 1518 size 일때
  const [isOtherShort, setIsOtherShort] = useState(false);

  const dispatch = useDispatch();
  const token = Cookies.get("accessJWTToken");
  const userInfo = GetUserInfo();
  const location = useLocation();

  const { total } = useSelector((state) => state.calendar);
  const { otherId } = useSelector((state) => state.header);

  useEffect(() => {
    if (location.pathname === "/other") {
      // 타유저 캘린더에 간 상황
      setDisabled(true);
      dispatch(__getTotalPosts({ userId: otherId }));
    } else {
      setDisabled(false);
      dispatch(__getTotalPosts({ userId: userInfo.userId }));
    }
  }, [isSubmit, otherId, location.pathname]);

  useEffect(() => {
    setNewData([]);

    if (total && total.length !== 0) {
      const result = total.map((data) => {
        const color = ColorFromDB(data.color);

        let end = "";
        let startDate = "";
        let endtDate = "";
        let isEdit = "";

        if (data.color === "GRAY" || location.pathname === "/other") {
          isEdit = false;
        } else {
          isEdit = true;
        }
        // 종료날짜 format
        if (data.startDate === data.endDate) {
          end = data.endData;
        } else if (data.startDate !== data.endDate && data.startTime === "00:00:00" && data.endTime === "00:00:00") {
          end = format(add(new Date(data.endDate), { days: 1 }), "yyyy-MM-dd");
        } else {
          end = format(new Date(data.endDate), "yyyy-MM-dd");
        }

        if (data.startTime === "00:00:00" && data.endTime === "00:00:00") {
          // 이건 하루 전체일정
          startDate = data.startDate;
          endtDate = end;
        } else {
          startDate = `${data.startDate}T${data.startTime}`;
          endtDate = `${end}T${data.endTime}`;
        }

        return {
          id: data.id,
          imageUrl: data.userProfileImage,
          title: data.title,
          start: startDate,
          end: endtDate,
          color: color,
          textColor: "#121212",
          editable: isEdit,
        };
      });
      setNewData(result);
    }
  }, [total]);

  // 일정추가 버튼 클릭 -> 모달창 여부
  const addButtonClick = () => {
    showAddpostModal();
  };
  const showAddpostModal = () => {
    setIsAddPost(true);
  };

  // 일정 more 클릭시
  const handleMoreLinkClick = (e) => {
    e.jsEvent.preventDefault();
    const pickDate = format(new Date(getYear(e.date), getMonth(e.date), getDate(e.date)), "yyyy-MM-dd");
    setMoreDate(pickDate);
    setIsTodaySchedule(true);
  };

  // 일정detail 클릭시
  const handlerEventClick = (e) => {
    props.setDetailPostId(e.event._def.publicId);
  };

  // 클릭한 date만
  const handlerDateClick = (date) => {
    if (location.pathname === "/home" && token) {
      setPickDate(date.date);
    }
  };

  // event drag-drop
  const handlerEventDrop = (info) => {
    const startDate = format(new Date(info.event._instance.range.start), "yyyy-MM-dd");
    const endDate = format(new Date(info.event._instance.range.end), "yyyy-MM-dd");
    let end = "";
    if (startDate === endDate) {
      end = endDate;
    } else {
      end = format(add(new Date(info.event._instance.range.end), { days: -1 }), "yyyy-MM-dd");
    }

    const newPost = {
      startDate,
      endDate: end,
    };

    dispatch(__updateDragPost({ updatePost: newPost, postId: info.event._def.publicId })).then(() => {
      dispatch(alertState({ state: true, comment: "일정 날짜가 수정되었습니다." }));
      props.setSide(!props.side);
    });
  };

  const setting = {
    selectable: true,
    headerToolbar: {
      left: "today",
      center: "prevYear prev title next nextYear",
      right: "addButton",
    },
    customButtons: {
      addButton: {
        text: "일정 추가",
        click: addButtonClick,
      },
    },

    views: {
      timeGrid: {
        dayMaxEventRows: 4,
        slotEventOverlap: false,
      },
    },
    buttonText: {
      //버튼 텍스트 변환
      today: "오늘",
    },
    timeZone: "local",
    events: newData,
    dayCellContent: function (args) {
      const date = args.date.getDate();
      return { html: `<span class='fc-daygrid-day-number'>${date}</span>` };
    },
    eventContent(eventInfo) {
      const { event } = eventInfo;
      return (
        <>
          {event.allDay ? (
            event.extendedProps.imageUrl === null ? (
              <img src={defaultImg} alt={event.title} />
            ) : (
              <img src={event.extendedProps.imageUrl} alt={event.title} />
            )
          ) : (
            !event.allDay && <AlldayColor isEventColor={event.backgroundColor}></AlldayColor>
          )}
          {event.title.length > 11 ? <span>{event.title.substr(0, 10)}...</span> : <span>{event.title}</span>}
        </>
      );
    },
  };

  return (
    <CalendarSidebarWrapper disabled={disabled}>
      {userInfo && location.pathname === "/other" && (
        <OtherUserCalendar
          otherCalendarState={otherCalendarState}
          setOtherCalendarState={setOtherCalendarState}
          setOtherCalendarPostId={setOtherCalendarPostId}
          isOtherShort={isOtherShort}
          setIsOtherShort={setIsOtherShort}
        />
      )}
      <CalendarWrapper disabled={disabled} isOtherShort={isOtherShort}>
        <CalendarContainer disabled={disabled}>
          <FullCalendar
            {...setting}
            plugins={[dayGridPlugin, interactionPlugin]}
            locale="ko"
            dayMaxEventRows={true}
            displayEventTime={false}
            initialView="dayGridMonth"
            moreLinkText="더보기"
            moreLinkClick={handleMoreLinkClick}
            eventClick={handlerEventClick}
            dateClick={handlerDateClick}
            eventDrop={handlerEventDrop}
          />
        </CalendarContainer>
        <AddPostModal
          isAddPost={isAddPost}
          setIsAddPost={setIsAddPost}
          side={props.side}
          setSide={props.setSide}
          pickDate={pickDate}
          setPickDate={setPickDate}
          isSubmit={isSubmit}
          setIsSubmit={setIsSubmit}
          modifyPostId={modifyPostId}
          setModifyPostId={setModifyPostId}
        />
        <DetailPostModal
          detailPostId={props.detailPostId}
          setDetailPostId={props.setDetailPostId}
          setModifyPostId={setModifyPostId}
          setIsAddPost={setIsAddPost}
          isSubmit={isSubmit}
          setIsSubmit={setIsSubmit}
          side={props.side}
          setSide={props.setSide}
          otherCalendarState={otherCalendarState}
          setOtherCalendarState={setOtherCalendarState}
          otherCalendarPostId={otherCalendarPostId}
          setOtherCalendarPostId={setOtherCalendarPostId}
          setDisabled={setDisabled}
          isTodaySchedule={isTodaySchedule}
          setIsTodaySchedule={setIsTodaySchedule}
          againToday={againToday}
          setAgainToday={setAgainToday}
        />
        <DayScheduleModal
          isTodaySchedule={isTodaySchedule}
          setIsTodaySchedule={setIsTodaySchedule}
          setIsAddPost={setIsAddPost}
          moreDate={moreDate}
          setDetailPostId={props.setDetailPostId}
          isSubmit={isSubmit}
          againToday={againToday}
          setAgainToday={setAgainToday}
        />
      </CalendarWrapper>
      {location.pathname !== "/other" && location.pathname !== "/friendsdetail" && (
        <CalendarSidebar isSideOpen={isSideOpen} setIsSideOpen={setIsSideOpen} isSubmit={isSubmit} setIsSubmit={setIsSubmit} />
      )}
    </CalendarSidebarWrapper>
  );
}

export default CalendarMain;

const CalendarSidebarWrapper = styled.div`
  ${(props) => props.theme.FlexRow};
  height: calc(1080px - 4rem - 0.0625rem);

  @media screen and (max-width: 1518px) {
    justify-content: ${(props) => props.disabled && "right"};
  }
`;

export const CalendarWrapper = styled.div`
  ${(props) => props.theme.FlexCol};
  width: 100%;
  height: 100%;
  padding: 20px 0;
  justify-content: flex-start;
  align-items: flex-start;

  @media screen and (max-width: 1518px) {
    // disabled == otherCalendar 갔을때
    padding-right: ${(props) => (props.disabled ? "40px" : "15px")};
    padding-left: 50px;
    padding-bottom: 30px;
    margin-left: ${(props) => props.isOtherShort && "21.875rem"};
  }

  @media screen and (max-width: 1440px) {
    padding-left: 40px;
  }
`;

const CalendarContainer = styled.div`
  ${(props) => props.theme.FlexCol};
  height: 100%;
  padding: 20px 50px;

  @media screen and (max-width: 1518px) {
    padding: ${(props) => (props.disabled ? "0px" : "20px")};
  }
  @media screen and (max-width: 1440px) {
    padding: 20px;
  }

  @media screen and (max-height: 1080px) {
    height: calc(100vh - 4rem - 0.0625rem);
  }

  .fc {
    width: 100%;
    height: 100%;
    color: #121212;
  }
  // 달력 헤더 영역
  .fc-toolbar {
    height: 2.6875rem;
    margin-bottom: 1.875rem !important;
  }
  // 헤더 각 요소 영역
  .fc-toolbar-chunk {
    display: flex;
    flex-direction: row;
    align-items: center;
    position: relative;
  }
  .fc-h-event .fc-event-title-container {
    cursor: pointer;
  }
  // 버튼 초기화
  .fc .fc-button-primary:disabled {
    background-color: white;
    color: #121212;
    border: none;
    margin: 0;
    &:active {
      outline: none;
      border: none;
    }
  }
  .fc .fc-button-primary {
    background-color: white;
    color: black;
    border: none;
    margin: 0;
    &:active {
      border: none;
      outline: none;
    }
    &:focus {
      border: none;
      outline: none;
    }
  }
  .fc-button {
    &:active {
      margin: 0;
    }
  }
  .fc-popover,
  .fc-more-popover {
    visibility: hidden;
  }
  // 버튼 감싸고 있는 div
  .fc-toolbar-chunk {
    display: flex;
    gap: 0.9375rem;
  }
  // prev, next button
  .fc-prev-button,
  .fc-next-button,
  .fc-nextYear-button,
  .fc-prevYear-button {
    ${(props) => props.theme.FlexCol};
    ${(props) => props.theme.ButtonSmall};
    width: 1.875rem !important;
    height: 1.875rem !important;
    border: solid 0.0875rem #121212 !important;
    .fc-icon {
      size: 0.9375rem;
    }
    &:active {
      background-color: #fbdf96 !important;
    }
  }
  // 일정추가 button
  .fc-addButton-button {
    visibility: ${(props) => props.disabled && "hidden"};
    ${(props) => props.theme.ButtonSmall};
    width: 6rem;
    height: 2.375rem;
    font-size: ${(props) => props.theme.Fs.size16};
    border: solid 0.0875rem #121212 !important;
    background-color: #0eafe1 !important;
    color: #ffffff !important;
  }
  // 오늘 button
  .fc-today-button {
    ${(props) => props.theme.ButtonSmall};
    width: 3rem;
    height: 2.375rem;
    font-size: ${(props) => props.theme.Fs.size14};
    border: solid 0.0875rem #121212 !important;
    color: #121212 !important;
    &:active {
      background-color: #fbdf96 !important;
    }
  }
  // 년,월
  .fc-toolbar-title {
    margin-right: 0.75em;
    font-size: ${(props) => props.theme.Fs.size24};
    font-weight: 600;
  }
  .fc-daygrid,
  .fc-timegrid {
    border: 0.0313rem solid ${(props) => props.theme.Bg.color3};
    border-radius: 0.25rem;
  }
  // date 각 한칸
  .fc-daygrid-day {
    padding: 0.5rem;
  }
  // 날짜 - 왼쪽으로
  .fc-daygrid-day-top {
    flex-direction: row;
    font-size: ${(props) => props.theme.Fs.size14};
  }
  .fc-daygrid-day-number {
    padding: 0;
    width: 20px;
    height: 20px;
    display: flex;
    align-items: center;
    justify-content: center;
  }
  // 오늘날짜
  .fc,
  .fc-daygrid-day.fc-day-today {
    background-color: transparent;
  }
  .fc-day-today {
    .fc-daygrid-day-top {
      a {
        display: flex;
        justify-content: center;
        align-items: center;
        color: #ffffff;
        font-weight: 600;
        text-decoration-color: ${(props) => props.theme.Bg.mainColor4};
        background-color: ${(props) => props.theme.Bg.mainColor5};
        border-radius: 50%;
      }
    }
  }
  .fc-theme-standard,
  .fc-scrollgrid {
    border: none;
  }
  .fc-theme-standard td {
    border-top: 0.0313rem solid ${(props) => props.theme.Bg.color3};
  }
  // event
  .fc-event-main {
    display: flex;
    align-items: center;
    overflow: hidden;
    cursor: pointer;
    img {
      width: 0.875rem;
      height: 0.875rem;
      border-radius: 50%;
      margin-left: 0.3125rem;
    }
    span {
      margin-left: 0.3125rem;
    }
  }

  table {
    border: none;
  }
  // 요일
  th {
    line-height: 1.875rem;
    border: none;
    border-right: 0.0313rem solid ${(props) => props.theme.Bg.color3};
    background: ${(props) => props.theme.Bg.color5};
    border-radius: 0.25rem;
    font-size: ${(props) => props.theme.Fs.size16};
  }
  th:last-child {
    border-right: none;
  }
  // 가로
  tr {
    border: none;
    border-bottom: 0.0313rem solid ${(props) => props.theme.Bg.color3};
  }
  tr:last-child {
    border-bottom: none;
  }
  // 세로
  td {
    border: none;
    border-right: 0.0313rem solid ${(props) => props.theme.Bg.color3};
  }
  td:last-child {
    border-right: none;
  }
  // 일정
  .fc-event {
    line-height: 1.25rem;
    font-size: ${(props) => props.theme.Fs.size14};
    vertical-align: middle;
  }
  // 더보기 글씨체
  .fc-more-link {
    font-size: ${(props) => props.theme.Fs.size12};
  }
  .fc-direction-ltr .fc-timegrid-slot-label-frame {
    text-align: center;
  }
  .fc-timegrid-axis-frame {
    justify-content: center;
  }
`;

const AlldayColor = styled.div`
  width: 0.625rem;
  height: 0.625rem;
  border-radius: 50%;
  margin-right: 0.3125rem;
  background-color: ${(props) => props.isEventColor};
`;
