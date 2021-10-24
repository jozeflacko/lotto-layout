import React from 'react';
import './App.css';

interface IConfig {
    howManySelectedBallsShouldRender: number,
    minBallNumber: number,
    maxBallNumber: number,
    allAvailableJokers: number[],
    minDraws: number,
    maxDraws: number,
    defaultDraws: number,
    minBets: number,
    maxBets: number,
    defaultBets: number,
    acceptanceDeadline: string,
}

interface IBet {
    quick: boolean,
    numbers: INumbers,
}

interface INumbers {
    [key: number]: INumber,
}

interface INumber {
    value: number,
    selected: boolean,
}

function App() {

    const [config] = React.useState<IConfig>({
        minBallNumber: 1,
        maxBallNumber: 45,
        howManySelectedBallsShouldRender: 6,
        allAvailableJokers: createRandomNumbers(100000, 999999, 10),
        minDraws: 1,
        maxDraws: 10,
        defaultDraws: 1,
        minBets: 1,
        maxBets: 12,
        defaultBets: 1,
        acceptanceDeadline: 'Mittwoch, 27.10.2021 18:30 Uhr'
    });

    const [wallet] = React.useState('€ 80, 70');
    const [price] = React.useState('€ 1,50');

    const [bets, setBets] = React.useState<IBet[]>([createBet(false, config.minBallNumber, config.maxBallNumber)]);
    const [playLottoPlus, setPlayLottoPlus] = React.useState(true);
    const [allAvailableJokers] = React.useState(createRandomNumbers(100000, 999999, 5));

    const [playJoker, setPlayJoker] = React.useState(true);

    const [selectedJokers, setSelectedJokers] = React.useState([allAvailableJokers[0]]);

    return (
        <div className={'app'}>
            <Lottos
                config={config}
                bets={bets}
                onBetsChange={bets => setBets(bets)}
            />
            <LottoPlus
                playLottoPlus={playLottoPlus}
                onChange={playLottoPlus => setPlayLottoPlus(playLottoPlus)}
            />
            <Jokers
                allAvailableJokers={allAvailableJokers}
                selectedJokers={selectedJokers}
                playJoker={playJoker}
                onChange={(clickedJoker, playJoker) => {
                    if (clickedJoker != null) {
                        const clickedJokerIndex = allAvailableJokers.indexOf(clickedJoker);
                        const jokers = allAvailableJokers.filter((joker, index) => index <= clickedJokerIndex);
                        setSelectedJokers(jokers);
                    }
                    setPlayJoker(playJoker);
                }}
            />
            <Draws/>
            <Pay/>
        </div>
    );
}

interface ILottosProps {
    bets: IBet[],
    onBetsChange: (bets: IBet[]) => void,
    config: IConfig,
}

function Lottos(props: ILottosProps) {

    return (
        <div className={'lottos'}>
            <h3>Lotto Bets</h3>
            {props.bets.map((bet, index) => <Lotto
                message={'Tipp ' + (index + 1) + '/' + props.config.maxBets}
                quick={bet.quick}
                numbers={bet.numbers}
                config={props.config}
                onBetChange={numbers => {
                    const clone = [...props.bets];
                    clone[index] = {...clone[index], numbers: numbers};
                    props.onBetsChange(clone);
                }}
                onDelete={() => props.onBetsChange(props.bets.filter(__bet => __bet !== bet))}
            />)}
            <Buttons>
                <Button onClick={() => {
                    const __newBets = [...props.bets];
                    __newBets.push(createBet(false, props.config.minBallNumber, props.config.maxBallNumber));
                    props.onBetsChange(__newBets);
                }}
                >
                    + Tipp
                </Button>
                <Button onClick={() => {
                    const __newBets = [...props.bets];
                    __newBets.push(createBet(true, props.config.minBallNumber, props.config.maxBallNumber));
                    props.onBetsChange(__newBets);
                }}>
                    + Quicktipp
                </Button>
            </Buttons>
        </div>
    )
}

function createBet(quick: boolean, minNumber: number, maxNumber: number): IBet {
    return {quick: quick, numbers: createNumbers(quick, minNumber, maxNumber)};
}

interface ILottoProps extends IBet {
    onBetChange: (s: INumbers) => void,
    onDelete: () => void,
    message: string,
    config: IConfig,
}

function Lotto(props: ILottoProps) {

    const [isDetailOpen, setIsDetailOpen] = React.useState(true);

    return (
        <div className={'lotto'}>
            <CollapsiblePanel
                isDetailOpen={isDetailOpen}
                header={<div className={'header'}>
                    <h4>{props.message}</h4>
                    <SelectedBalls numbers={props.numbers} howManyShouldBe={props.config.howManySelectedBallsShouldRender}/>
                    <Buttons>
                        <Button
                            onClick={() => props.onBetChange(createNumbers(true, props.config.minBallNumber, props.config.maxBallNumber))}>refresh</Button>
                        <Button onClick={() => setIsDetailOpen(old => !old)}>open/close</Button>
                        <Button
                            onClick={() => props.onBetChange(createNumbers(false, props.config.minBallNumber, props.config.maxBallNumber))}>clear</Button>
                        <Button onClick={() => props.onDelete()}> delete</Button>
                    </Buttons>
                </div>}
                detail={<BetTable
                    numbers={props.numbers}
                    onClick={numbers => {
                        const numberOfOfAlreadySelectedNumbersCurrently = Object.keys(props.numbers).filter(key => props.numbers[Number(key)].selected).length;
                        const numberOfOfAlreadySelectedNumbers = Object.keys(numbers).filter(key => numbers[Number(key)].selected).length;
                        if (numberOfOfAlreadySelectedNumbers < props.config.howManySelectedBallsShouldRender) {
                            props.onBetChange(numbers);
                        } else if (numberOfOfAlreadySelectedNumbersCurrently < props.config.howManySelectedBallsShouldRender) {
                            props.onBetChange(numbers);
                        }
                    }}
                />}
            />
        </div>
    )
}

interface ICollapsiblePanelProps {
    header: JSX.Element,
    detail: JSX.Element,
    isDetailOpen: boolean,
}

function CollapsiblePanel(props: ICollapsiblePanelProps) {
    return (
        <div className={'collapsible-panel'}>
            <div className={'header'}>
                {props.header}
            </div>
            {props.isDetailOpen && <div className={'detail'}>
                {props.detail}
            </div>}
        </div>
    )
}

function SelectedBalls(props: { numbers: INumbers, howManyShouldBe: number }) {
    const balls = Object.keys(props.numbers)
        .filter(key => props.numbers[Number(key)].selected)
        .map(key => {
            const number: INumber = props.numbers[Number(key)];
            return {...number, key: number.value + '_selected'}
        });

    if (balls.length < props.howManyShouldBe) {
        let iterator = 0;
        while (balls.length !== props.howManyShouldBe) {
            balls.push({value: -1, selected: false, key: iterator + '_placeholder'})
        }
    }

    return <div
        className={'selected-numbers'}
        key={balls.map(b => b.key).join('___')}
    >
        {balls.map(b => <Ball value={b.value} key={b.key}/>)}
    </div>;
}

function createNumbers(randomNumber: boolean, min: number, max: number) {
    const numbers: INumbers = {};
    const selectedRandomNumbers = randomNumber ? createRandomNumbers() : [];
    for (let i = min; i <= max; i++) {
        numbers[i] = {
            value: i,
            selected: selectedRandomNumbers.includes(i)
        };
    }
    return numbers;
}

function createRandomNumbers(min = 1, max = 45, howMany = 6) {
    const randomNumbers: number[] = [];
    while (randomNumbers.length !== howMany) {
        const number: number = Math.floor(Math.random() * max) + min;
        if (!randomNumbers.includes(number)) {
            randomNumbers.push(number);
        }
    }
    return randomNumbers;
}

interface IBetTableProps {
    numbers: INumbers,
    onClick: (numbers: INumbers) => void,
}

function BetTable(props: IBetTableProps) {

    return (
        <div className={'bet-table'}>
            {Object.keys(props.numbers).map(key => {
                const number = props.numbers[Number(key)];
                return <BetField
                    value={number.value}
                    selected={number.selected}
                    onClick={() => {
                        const clone = {...props.numbers};
                        clone[Number(key)] = {...clone[Number(key)], selected: !clone[Number(key)].selected};
                        props.onClick(clone);
                    }}
                />;
            })}
        </div>
    )
}

interface IBetFieldProps extends INumber {
    onClick: () => void,
}

function BetField(props: IBetFieldProps) {
    return <div
        className={'bet-field' + (props.selected ? ' selected' : '')}
        onClick={() => props.onClick()}
    >{props.value}</div>
}

interface IBallProps {
    value: number;
}

function Ball(props: IBallProps) {
    return <div className={'ball'}>{props.value < 0 ? '' : props.value}</div>
}

interface ILottoPlusProps {
    playLottoPlus: boolean,
    onChange: (playLottoPlus: boolean) => void,
}

function LottoPlus(props: ILottoPlusProps) {
    return (
        <div className={'box lotto-plus'}>
            <h4>Lotto Plus</h4>
            <Buttons>
                <Button
                    onClick={() => props.onChange(false)}
                    active={props.playLottoPlus === false}
                >No</Button>
                <Button
                    onClick={() => props.onChange(true)}
                    active={props.playLottoPlus === true}
                >Yes</Button>
            </Buttons>
        </div>
    )
}


interface IJokersProps {
    allAvailableJokers: number[],
    selectedJokers: number[],
    playJoker: boolean,
    onChange: (joker: number | null, playJoker: boolean) => void,
}

function Jokers(props: IJokersProps) {

    return (
        <div className={'box jokers'}>
            <CollapsiblePanel
                isDetailOpen={props.playJoker}
                header={<div className={'header'}>
                    <h4>Joker</h4>
                    <Buttons>
                        <Button
                            onClick={() => props.onChange(null, false)}
                            active={!props.playJoker}
                        >No</Button>
                        <Button
                            onClick={() => props.onChange(null, true)}
                            active={props.playJoker}
                        >Yes</Button>
                    </Buttons>
                </div>}
                detail={<Buttons>
                    {props.allAvailableJokers.map(n => <Button
                        active={props.selectedJokers.includes(n)}
                        onClick={() => props.onChange(n, true)}
                    >
                        {n}
                    </Button>)}
                </Buttons>}
            />
        </div>
    )
}

function Draws() {
    return (
        <div className={'box jokers'}>
            <h4>Spieldauer</h4>
            <Buttons>
                <Button>1</Button>
                <Button>2</Button>
            </Buttons>
            <h5>Ziehungen</h5>
        </div>
    )
}

function Buttons(props: { children: any }) {
    return <div className={'buttons'}>{props.children}</div>
}

function Button(props: { children: string | number, onClick?: () => void, active?: boolean }) {
    return <button
        className={'button' + (props.active ? ' active' : '')}
        onClick={() => props.onClick && props.onClick()}
    >
        {props.children}
    </button>
}

function Pay() {
    return (
        <Button>Tippabgabe</Button>
    )
}

export default App;
