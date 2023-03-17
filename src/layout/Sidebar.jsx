import React from "react";
import { useSelector } from "react-redux";
import { useParams } from "react-router";
import styled from "styled-components";
import { useState } from "react";
import { useEffect } from "react";
import SidebarMyCalendar from "../components/SidebarMyCalendar";
import SidebarOtherCalendar from "../components/SidebarOtherCalendar";

function Sidebar() {
  const [userInfo, setUserInfo] = useState("");
  const param = useParams();

  //const nickName = useSelector((state) => state.users);
  // 로컬 스토리지 userInfo
  useEffect(() => {
    const storedUserInfo = localStorage.getItem("userInfo");
    if (storedUserInfo) {
      setUserInfo(JSON.parse(storedUserInfo));
    }
  }, []);
  console.log("param : ", param.id);
  console.log("local", userInfo.userId);

  return <SidebarWrapper>{param === userInfo.userId ? <SidebarMyCalendar nickName={userInfo.nickName} /> : <SidebarOtherCalendar />}</SidebarWrapper>;
}

export default Sidebar;

const SidebarWrapper = styled.div`
  background-color: ${(props) => props.theme.Bg.lightColor};
  min-width: 350px;
  height: 100%;
  padding: 52px 34px;
`;
