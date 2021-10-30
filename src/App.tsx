import React from 'react';
import './App.css';
import {useSwipeable} from 'react-swipeable';

interface IDefaultValues {
    numberOfSelectedNumbers: number,
    minBallNumber: number,
    maxBallNumber: number,
    availableJokers: number[],
    minDraws: number,
    maxDraws: number,
    initNumberOfDraws: number,
    minBets: number,
    maxBets: number,
    numberOfBets: number,
    acceptanceDeadline: string,
    initBet: IBet[],
    initPlayLottoPlus: boolean,
    initJokers: number[],
    initPlayJokers: boolean,
}

interface IBet {
    quick: boolean,
    numbers: INumbers,
    areAllNumbersSelected: boolean,
}

interface INumbers {
    [key: number]: INumber,
}

interface INumber {
    value: number,
    selected: boolean,
}

const PRICE = {
    BET: 120,
    LOTTO_PLUS: 50,
    JOKER: 150,
}

interface IProps {
    showPreview: boolean,
}

const allAvailableJokers = createRandomNumbers(100000, 999999, 10);

function App() {

    const defaultValues: IDefaultValues = {
        minBallNumber: 1,
        maxBallNumber: 45,
        numberOfSelectedNumbers: 6,
        availableJokers: allAvailableJokers,
        minDraws: 1,
        maxDraws: 10,
        initNumberOfDraws: 1,
        minBets: 1,
        maxBets: 12,
        numberOfBets: 1,
        acceptanceDeadline: 'Mittwoch, 27.10.2021 18:30 Uhr',
        initBet: [createBet(false, 1, 45, 6)],
        initPlayLottoPlus: true,
        initPlayJokers: true,
        initJokers: [allAvailableJokers[0]],
    };

    const [wallet] = React.useState(80000);
    const [price, setPrice] = React.useState(0);

    // game
    const [bets, setBets] = React.useState<IBet[]>(defaultValues.initBet);
    const [playLottoPlus, setPlayLottoPlus] = React.useState(defaultValues.initPlayLottoPlus);
    const [playJoker, setPlayJokers] = React.useState(defaultValues.initPlayJokers);
    const [selectedJokers, setSelectedJokers] = React.useState(defaultValues.initJokers);
    const [numberOfDraws, setNumberOfDraws] = React.useState(defaultValues.initNumberOfDraws);

    const swipeHandlers = useSwipeable({
        onSwipedLeft: (event) => {
            if (showPreview) {
                setShowPreview(false);
            }
        },
        onSwipedRight: (event) => {
            if (!showPreview) {
                setShowPreview(true);
            }
        },
    });

    function resetAll() {
        setBets(defaultValues.initBet);
        setPlayLottoPlus(defaultValues.initPlayLottoPlus);
        setPlayJokers(defaultValues.initPlayJokers);
        setSelectedJokers(defaultValues.initJokers);
        setNumberOfDraws(defaultValues.initNumberOfDraws);
    }

    const [showPreview, setShowPreview] = React.useState(false);

    React.useEffect(() => {
        let __price = 0;
        __price += bets.length * PRICE.BET;
        __price += playLottoPlus ? PRICE.LOTTO_PLUS : 0;
        __price += playJoker ? (selectedJokers.length * PRICE.JOKER) : 0;
        __price = __price * numberOfDraws;
        setPrice(__price);
    });

    return (
        <div className={'app'} {...swipeHandlers}>
            <Info
                showPreview={showPreview}
                wallet={wallet}
                price={price}
                acceptanceDeadline={defaultValues.acceptanceDeadline}
            />
            <Bets
                showPreview={showPreview}
                defaultValues={defaultValues}
                bets={bets}
                onBetsChange={bets => setBets(bets)}
            />
            <LottoPlus
                showPreview={showPreview}
                playLottoPlus={playLottoPlus}
                onChange={playLottoPlus => setPlayLottoPlus(playLottoPlus)}
            />
            <Jokers
                showPreview={showPreview}
                allAvailableJokers={allAvailableJokers}
                selectedJokers={selectedJokers}
                playJoker={playJoker}
                onChange={(clickedJoker, playJoker) => {
                    if (clickedJoker != null) {
                        const clickedJokerIndex = allAvailableJokers.indexOf(clickedJoker);
                        const jokers = allAvailableJokers.filter((joker, index) => index <= clickedJokerIndex);
                        setSelectedJokers(jokers);
                    }
                    setPlayJokers(playJoker);
                }}
            />
            <Draws
                showPreview={showPreview}
                defaultValues={defaultValues}
                numberOfDraws={numberOfDraws}
                onDrawsClick={numberOfDraws => setNumberOfDraws(numberOfDraws)}
            />
            <Actions
                onPay={() => {
                }}
                onReset={() => resetAll()}
                showPreview={showPreview}
                onShowPreview={show => setShowPreview(show)}
                price={price}
            />
        </div>
    );
}

interface IBetsProps extends IProps {
    bets: IBet[],
    onBetsChange: (bets: IBet[]) => void,
    defaultValues: IDefaultValues,
}

function Bets(props: IBetsProps) {

    const [layout, setLayout] = React.useState<'vertical' | 'horizontal'>('vertical');

    const isMaximumNumberOfBetsSelected = props.bets.length >= props.defaultValues.maxBets;

    let areAddBetButtonsDisabled = false;
    let hint = '';

    if (isMaximumNumberOfBetsSelected) {
        areAddBetButtonsDisabled = true;
        hint = 'You have selected maximal possible amount of bets';
    }

    const isDeleteDisabled = props.bets.length <= props.defaultValues.minBets;

    return (
        <div
            className={mergeClassNames(
                'bets',
                'box',
                {
                    'layout-vertical': layout === 'vertical',
                    'layout-horizontal': layout === 'horizontal',
                }
            )}
        >
            <h3>Lotto Bets</h3>
            <Buttons>
                <Button
                    onClick={() => setLayout(layout !== 'vertical' ? 'vertical' : 'horizontal')}
                >
                    {layout === 'vertical' ? 'vetical' : 'horizontal'}
                </Button>
            </Buttons>
            <div className={'items'}>
                {props.bets.map((bet, index) => {
                    return <div className={'item'}>
                        <Lotto
                            key={index}
                            showPreview={props.showPreview}
                            message={'Tipp ' + (index + 1) + '/' + props.defaultValues.maxBets}
                            areAllNumbersSelected={bet.areAllNumbersSelected}
                            quick={bet.quick}
                            numbers={bet.numbers}
                            defaultValues={props.defaultValues}
                            onBetChange={numbers => {
                                const clone = [...props.bets];
                                const current = clone[index];
                                current.numbers = numbers;
                                current.areAllNumbersSelected = isBetFullySelected(current, props.defaultValues.numberOfSelectedNumbers);
                                current.quick = false;
                                clone[index] = current;
                                props.onBetsChange(clone);
                            }}
                            onDelete={isDeleteDisabled ? undefined : () => props.onBetsChange(props.bets.filter(__bet => __bet !== bet))}
                        />
                    </div>
                })}
            </div>
            {!props.showPreview && <div>
                <Hint>{hint}</Hint>
                <Buttons>
                    <Button
                        disabled={areAddBetButtonsDisabled}
                        onClick={() => {
                            const __newBets = [...props.bets];

                            __newBets.push(createBet(
                                false,
                                props.defaultValues.minBallNumber, props.defaultValues.maxBallNumber,
                                props.defaultValues.numberOfSelectedNumbers
                            ))

                            props.onBetsChange(__newBets);
                        }}
                    >
                        Add Tipp
                    </Button>
                    <Button
                        disabled={areAddBetButtonsDisabled}
                        maxNumberOfMultiClick={props.defaultValues.maxBets /* TODO calculate correct number */}
                        onClick={(howMany) => {
                            const __newBets = [...props.bets];

                            new Array(howMany).fill(0).forEach(() => {
                                __newBets.push(createBet(
                                    true,
                                    props.defaultValues.minBallNumber,
                                    props.defaultValues.maxBallNumber,
                                    props.defaultValues.numberOfSelectedNumbers
                                ));
                            });
                            props.onBetsChange(__newBets);
                        }}
                    >
                        {n => n <= 1 ? 'Add 1 QuickTipp' : 'Add ' + n + ' QuickTipps'}
                    </Button>
                </Buttons>
            </div>}
        </div>
    )
}

function createBet(
    quick: boolean,
    minNumber: number,
    maxNumber: number,
    numberOfSelectedNumbers: number,
): IBet {

    const bet: IBet = {
        quick: quick,
        numbers: createNumbers(quick, minNumber, maxNumber, numberOfSelectedNumbers),
        areAllNumbersSelected: quick
    };

    return {...bet, areAllNumbersSelected: isBetFullySelected(bet, numberOfSelectedNumbers)};
}

interface ILottoProps extends IBet, IProps {
    onBetChange: (s: INumbers) => void,
    onDelete?: () => void,
    message: string,
    defaultValues: IDefaultValues,
}

function Lotto(props: ILottoProps) {

    const [isOpen, setIsDetailOpen] = React.useState(true);

    function createBetNumbers(randomNumbers: boolean) {
        return createNumbers(
            randomNumbers,
            props.defaultValues.minBallNumber,
            props.defaultValues.maxBallNumber,
            props.defaultValues.numberOfSelectedNumbers
        );
    }

    function handleCreateNumbers(randomNumbers: boolean) {
        props.onBetChange(createBetNumbers(randomNumbers));
    }

    return (
        <div className={'lotto'}>
            <CollapsiblePanel
                showPreview={props.showPreview}
                isOpen={isOpen}
                onToggleIsOpenClick={isOpen => setIsDetailOpen(isOpen)}
                header={<div className={'header'}>
                    <h4>{props.message}</h4>
                    <SelectedNumbers
                        numbers={props.numbers}
                        howManyShouldBe={props.defaultValues.numberOfSelectedNumbers}
                        areAllNumbersSelected={props.areAllNumbersSelected}
                    />
                    {!props.showPreview && <Buttons>
                        <Button
                            onClick={() => handleCreateNumbers(true)}
                        >
                            refresh
                        </Button>
                        <Button
                            onClick={() => handleCreateNumbers(false)}
                        >
                            clear
                        </Button>
                        <Button
                            onClick={() => props.onDelete && props.onDelete()}
                            disabled={props.onDelete == null}
                        >
                            delete
                        </Button>
                    </Buttons>}
                </div>}
                detail={<GridNumbers
                    numbers={props.numbers}
                    areAllNumbersSelected={props.areAllNumbersSelected}
                    onClick={numbers => {
                        const numberOfOfAlreadySelectedNumbersCurrently = Object.keys(props.numbers).filter(key => props.numbers[Number(key)].selected).length;
                        const numberOfOfAlreadySelectedNumbers = Object.keys(numbers).filter(key => numbers[Number(key)].selected).length;
                        if (numberOfOfAlreadySelectedNumbers < props.defaultValues.numberOfSelectedNumbers) {
                            props.onBetChange(numbers);
                        } else if (numberOfOfAlreadySelectedNumbersCurrently < props.defaultValues.numberOfSelectedNumbers) {
                            props.onBetChange(numbers);
                        }
                    }}
                />}
            />
        </div>
    )
}

interface ICollapsiblePanelProps extends IProps {
    header: JSX.Element,
    detail: JSX.Element,
    isOpen: boolean,
    onToggleIsOpenClick: (isOpen: boolean) => void,
}

function CollapsiblePanel(props: ICollapsiblePanelProps) {
    return (
        <div className={'collapsible-panel'}>
            <div className={'header'}>
                {props.header}
            </div>
            {!props.showPreview && props.isOpen && <div className={'detail'}>
                {props.detail}
            </div>}
            {!props.showPreview && <div
                className={'show-more-or-less'}
                onClick={() => props.onToggleIsOpenClick(!props.isOpen)}
            >
                <span className={'label'}>{props.isOpen ? 'Weniger anzeigen' : 'Mehr anzeigen'}</span>
                <span className={'icon'}>{props.isOpen ? 'UP' : 'down'}</span>
            </div>}
        </div>
    )
}

interface ISelectedBallsProps {
    numbers: INumbers,
    howManyShouldBe: number,
    areAllNumbersSelected: boolean,
}

function SelectedNumbers(props: ISelectedBallsProps) {
    const numbers = Object.keys(props.numbers)
        .filter(key => props.numbers[Number(key)].selected)
        .map(key => {
            const number: INumber = props.numbers[Number(key)];
            return {...number, key: number.value + '_selected'}
        });

    if (numbers.length < props.howManyShouldBe) {
        let iterator = 0;
        while (numbers.length !== props.howManyShouldBe) {
            numbers.push({value: -1, selected: false, key: iterator + '_placeholder'})
            iterator++;
        }
    }

    return <div
        className={'selected-numbers'}
        key={numbers.map(b => b.key).join('___')}
    >
        {numbers.map(b => <Ball
            value={b.value}
            key={b.key}
            variant={props.areAllNumbersSelected ? 'primary' : undefined}
        />)}
        {props.areAllNumbersSelected ? 'OK' : ''}
    </div>;
}

function createNumbers(randomNumber: boolean, min: number, max: number, howMany: number) {
    const numbers: INumbers = {};
    const selectedRandomNumbers = randomNumber ? createRandomNumbers(min, max, howMany) : [];
    for (let i = min; i <= max; i++) {
        numbers[i] = {
            value: i,
            selected: selectedRandomNumbers.includes(i)
        };
    }
    return numbers;
}

function createRandomNumbers(min: number, max: number, howMany: number) {
    const randomNumbers: number[] = [];
    while (randomNumbers.length !== howMany) {
        const number: number = Math.floor(Math.random() * max) + min;
        if (!randomNumbers.includes(number)) {
            randomNumbers.push(number);
        }
    }
    return randomNumbers;
}

interface IGridNumbersProps {
    numbers: INumbers,
    onClick: (numbers: INumbers) => void,
    areAllNumbersSelected: boolean,
}

function GridNumbers(props: IGridNumbersProps) {

    return (
        <div className={'grid-numbers'}>
            {Object.keys(props.numbers).map(key => {
                const number = props.numbers[Number(key)];
                return <GridNumber
                    key={number.value}
                    value={number.value}
                    variant={props.areAllNumbersSelected ? 'primary' : 'default'}
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

interface IGrindNumberProps extends INumber {
    onClick: () => void,
    variant: 'primary' | 'default'
}

function GridNumber(props: IGrindNumberProps) {
    return <div
        className={mergeClassNames(
            'grid-number',
            {
                'selected': props.selected,
                'primary': props.variant === 'primary',
            }
        )}
        onClick={() => props.onClick()}
    >
        <div className={'grid-number-value'}>{props.value}</div>
    </div>
}

interface IBallProps {
    value: number;
    variant?: 'primary' | 'default'
}

function Ball(props: IBallProps) {
    return <div
        className={mergeClassNames(
            'ball',
            {
                'primary': props.variant === 'primary',
            }
        )}
    >
        {props.value < 0 ? '' : props.value}
    </div>
}

interface ILottoPlusProps extends IProps {
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


interface IJokersProps extends IProps {
    allAvailableJokers: number[],
    selectedJokers: number[],
    playJoker: boolean,
    onChange: (joker: number | null, playJoker: boolean) => void,
}

function Jokers(props: IJokersProps) {

    return (
        <div className={'box jokers'}>
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
            <Buttons>
                {props.showPreview ? props.selectedJokers : props.allAvailableJokers.map(n => <Button
                    key={n}
                    active={!props.playJoker ? false : props.selectedJokers.includes(n)}
                    onClick={() => props.onChange(n, true)}
                    disabled={!props.playJoker}
                >
                    {n}
                </Button>)}
            </Buttons>
        </div>
    )
}

interface IDrawsProps extends IProps {
    defaultValues: IDefaultValues,
    numberOfDraws: number,
    onDrawsClick: (numberOfDraws: number) => void
}

function Draws(props: IDrawsProps) {

    const draws = [];
    for (let i = 1; i <= props.defaultValues.maxDraws; i++) {
        if (!props.showPreview || props.numberOfDraws === i) {
            draws.push({value: i, selected: props.numberOfDraws === i})
        }

    }

    return (
        <div className={'box jokers'}>
            <h4>Spieldauer</h4>
            <Buttons>
                {draws.map(b => <Button
                    key={b.value}
                    active={b.selected}
                    onClick={() => props.onDrawsClick(b.value)}
                >
                    {b.value}
                </Button>)}
            </Buttons>
            <h5>Ziehungen</h5>
        </div>
    )
}

interface IInfoProps extends IProps {
    wallet: number,
    price: number,
    acceptanceDeadline: string,
}

function Info(props: IInfoProps) {
    return <div className={'info box'}>
        <div>
            <span>wallet: {toEuro(props.wallet)}</span>
            <span>price: {toEuro(props.price)}</span>
        </div>
        <div>
            <span>Annahmeschluss: {props.acceptanceDeadline}</span>
        </div>
    </div>
}

function Buttons(props: { children: any }) {
    return <div className={'buttons'}>{props.children}</div>
}

interface IButtonProps {
    children: string | number | ((numberOfClicks: number) => string),
    onClick?: (numberOfTimesButtonWasClicked: number) => void,
    active?: boolean,
    disabled?: boolean,
    className?: string,
    maxNumberOfMultiClick?: number,
}

function Button(props: IButtonProps) {

    function reset() {
        setNumberOfClicks(0);
        setIsDropdownOpen(false);
        setShowConfirm(false);
    }

    function callClickAndReset(event: any, _numberOfClicks: number) {
        props.onClick && props.onClick(_numberOfClicks);
        reset();
    }

    const maxNumberOfMultiClick = props.maxNumberOfMultiClick || 1;
    const [numberOfClicks, setNumberOfClicks] = React.useState(0);
    const [showConfirm, setShowConfirm] = React.useState(false);

    const [timer, setTimer] = React.useState<any>();

    function handleClick(event: any, _numberOfClicks?: number) {
        event.preventDefault();
        const current = event.target;

        if (props.onClick == null) {
            return;
        } else if (current && current.classList.contains('selection')) {
            setIsDropdownOpen(!isDropdownOpen);
            setNumberOfClicks(0);
            setShowConfirm(false);
        } else if (current && current.classList.contains('confirm-yes')) {
            callClickAndReset(event, numberOfClicks);
        } else if (current && current.classList.contains('confirm-no')) {
            reset();
        } else if (isDropdownOpen) {
            reset();
        } else if (_numberOfClicks == null && maxNumberOfMultiClick === 1) {
            callClickAndReset(event, 1);
        } else {
            clearTimeout(timer);
            setNumberOfClicks(previousNumberOfClicks => {
                const newNumberOfClicks = previousNumberOfClicks + 1;
                setTimer(setTimeout(() => {
                    if (newNumberOfClicks === 1) {
                        callClickAndReset(event, newNumberOfClicks);
                    } else {
                        setShowConfirm(true);
                    }
                }, 500));
                return newNumberOfClicks;
            });
        }
    }


    const options: number[] = [];
    for (let i = 2; i <= maxNumberOfMultiClick; i++) {
        options.push(i);
    }

    const [isDropdownOpen, setIsDropdownOpen] = React.useState(false);

    return <button className={props.className + ' button' + (props.active ? ' active' : '')}
                   disabled={props.disabled === true}
                   onClick={event => handleClick(event)}
    >
        {showConfirm ? <>
                <div className={'confirm-yes'}>
                    Click Confirm adding {numberOfClicks} items?
                </div>
                <div style={{margin: '0 1em'}}> |</div>
                <div className={'confirm-no'}>Cancel</div>
            </>
            :
            <>
                {
                    typeof props.children === 'function' ?
                        props.children(numberOfClicks) :
                        props.children
                }
                {maxNumberOfMultiClick > 1 ? <>
                    <div
                        className={'selection'}
                        onClick={event => handleClick(event)}
                    >
                        {isDropdownOpen ? '<' : '>'}
                    </div>
                    {isDropdownOpen && <div className={'options'}>
                        <Hint>Choose how many to add</Hint>
                        {options.map(o => <div
                            className={'option'}
                            onClick={(event) => callClickAndReset(event, o)}
                        >{o}</div>)}
                    </div>}
                </> : ''}
            </>
        }
    </button>
}

interface IActionsProps extends IProps {
    onShowPreview: (show: boolean) => void;
    onPay: () => void;
    onReset: () => void;
    price: number,
}

function Actions(props: IActionsProps) {
    return (
        <div className={'pay-row'}>
            <div>Total Price: {toEuro(props.price)}</div>
            <Buttons>
                {!props.showPreview && <Button
                        className={'btn-preview'}
                        onClick={() => props.onShowPreview(true)}
                    >
                        Show Ticket Preview
                    </Button>}
                {props.showPreview && <Button
                    className={'btn-back'}
                    onClick={() => props.onShowPreview(false)}
                >
                    Back to game
                </Button>}
                {props.showPreview && <Button
                    className={'btn-pay'}
                    onClick={props.onPay}
                >
                    Tippabgabe
                </Button>}
            </Buttons>
        </div>
    )
}

function isBetFullySelected(bet: IBet, numberOfSelectedNumbers: number) {
    const actualNumberOfSelectedNumbers = Object.keys(bet.numbers)
        .filter(key => bet.numbers[Number(key)].selected).length;
    return actualNumberOfSelectedNumbers === numberOfSelectedNumbers;
}

function isAtLeastOneNumberSelected(numbers: INumbers) {
    const actualNumberOfSelectedNumbers = Object.keys(numbers)
        .filter(key => numbers[Number(key)].selected).length;
    return actualNumberOfSelectedNumbers > 0;
}

function toEuro(cents: number) {
    return '€ ' + (cents / 100).toFixed(2);
}

function mergeClassNames(...params: (null | undefined | string | { [key: string]: boolean })[]) {
    let classNames: string[] = [];
    params.forEach(param => {
        if (param == null) {
            // skip
        } else if (typeof param === 'string') {
            classNames.push(param);
        } else {
            classNames = [
                ...classNames,
                ...Object.keys(param).filter(className => param[className])];
        }
    });
    return classNames.join(' ');
}

interface IHintProps {
    children: string;
}

function Hint(props: IHintProps) {
    return <div className={'hint'}>{props.children}</div>
}

export default App;

