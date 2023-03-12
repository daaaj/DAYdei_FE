import React, { useState } from 'react';
import styled from 'styled-components';
import CalendarMain from '../components/calendar/CalendarMain';

function Main() {
    return (
        <CalendarWrapper>
            <CalendarMain />
        </CalendarWrapper>
    );
}

export default Main;

const CalendarWrapper = styled.div`
    ${(props) => props.theme.FlexCol}
    width: 80%;
`;
