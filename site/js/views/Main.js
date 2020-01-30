import styled from 'styled-components';

export const Main = styled.main`
    width: 100vw;
    height: 100vh;
    overflow: hidden;
    position: relative;
    background-color: ${({ transparent }) => (transparent ? 'transparent' : 'black')};
`;
