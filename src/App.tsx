import React from 'react';
import './App.css';

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

const allAvailableJokers = createRandomNumbers(100000, 999999, 10);

function App() {

    const defaultValues:IDefaultValues = {
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

    function resetAll() {
        setBets(defaultValues.initBet);
        setPlayLottoPlus(defaultValues.initPlayLottoPlus);
        setPlayJokers(defaultValues.initPlayJokers);
        setSelectedJokers(defaultValues.initJokers);
        setNumberOfDraws(defaultValues.initNumberOfDraws);
    }

    const [showPayButton, setShowPayButton] = React.useState(false);
    const [showPreviewButton, setShowPreviewButton] = React.useState(false);
    const [showResetButton, setShowResetButton] = React.useState(false);

    React.useEffect(() => {
        let __price = 0;
        __price += bets.length * PRICE.BET;
        __price += playLottoPlus ? PRICE.LOTTO_PLUS : 0;
        __price += playJoker ? (selectedJokers.length * PRICE.JOKER) : 0;
        __price = __price * numberOfDraws;
        setPrice(__price);
    });

    return (
        <div className={'app'}>
            <Info
                wallet={wallet}
                price={price}
                acceptanceDeadline={defaultValues.acceptanceDeadline}
            />
            <Lottos
                config={defaultValues}
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
                    setPlayJokers(playJoker);
                }}
            />
            <Draws
                config={defaultValues}
                numberOfDraws={numberOfDraws}
                onDrawsClick={numberOfDraws => setNumberOfDraws(numberOfDraws)}
            />
            <Actions
                onPay={() => {}}
                onReset={() => resetAll()}
                onShowPreview={() => {}}
                activatePayButton={showPayButton}
                showResetButton={showResetButton}
                showPreviewButton={showPreviewButton}
                price={price}
            />
        </div>
    );
}

interface ILottosProps {
    bets: IBet[],
    onBetsChange: (bets: IBet[]) => void,
    config: IDefaultValues,
}

function Lottos(props: ILottosProps) {

    const isMaximumNumberOfBetsSelected = props.bets.length >= props.config.maxBets;

    let areAddBetButtonsDisabled = false;
    let hint = '';

    if(isMaximumNumberOfBetsSelected) {
        areAddBetButtonsDisabled = true;
        hint = 'You have selected maximal possible amount of bets';
    }

    const isDeleteDisabled = props.bets.length <= props.config.minBets;

    return (
        <div className={'lottos box'}>
            <h3>Lotto Bets</h3>
            {props.bets.map((bet, index) => {

                return <Lotto
                    message={'Tipp ' + (index + 1) + '/' + props.config.maxBets}
                    areAllNumbersSelected={bet.areAllNumbersSelected}
                    quick={bet.quick}
                    numbers={bet.numbers}
                    defaultValues={props.config}
                    onBetChange={numbers => {
                        const clone = [...props.bets];
                        const current = clone[index];
                        current.numbers = numbers;
                        current.areAllNumbersSelected = isBetFullySelected(current, props.config.numberOfSelectedNumbers);
                        current.quick = false;
                        clone[index] = current;
                        props.onBetsChange(clone);
                    }}
                    onDelete={isDeleteDisabled ? undefined : () => props.onBetsChange(props.bets.filter(__bet => __bet !== bet))}
                />
            })}
            <div>
                <Hint>{hint}</Hint>
                <Buttons>
                    <Button
                        disabled={areAddBetButtonsDisabled}
                        onClick={() => {
                            const __newBets = [...props.bets];
                            __newBets.push(createBet(
                                false,
                                props.config.minBallNumber, props.config.maxBallNumber,
                                props.config.numberOfSelectedNumbers
                            ));
                            props.onBetsChange(__newBets);
                        }}
                    >
                        Add Tipp
                    </Button>
                    <Button
                        disabled={areAddBetButtonsDisabled}
                        maxNumberOfMultiClick={10}
                        onClick={() => {
                            const __newBets = [...props.bets];
                            __newBets.push(createBet(
                                true,
                                props.config.minBallNumber,
                                props.config.maxBallNumber,
                                props.config.numberOfSelectedNumbers
                            ));
                            props.onBetsChange(__newBets);
                        }}
                    >
                        Add Quicktipp/s
                    </Button>
                </Buttons>
            </div>
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

interface ILottoProps extends IBet {
    onBetChange: (s: INumbers) => void,
    onDelete?: () => void,
    message: string,
    defaultValues: IDefaultValues,
}

function Lotto(props: ILottoProps) {

    const [isOpen, setIsDetailOpen] = React.useState(true);

    function createBetNumbers(randomNumbers:boolean) {
        return createNumbers(
            randomNumbers,
            props.defaultValues.minBallNumber,
            props.defaultValues.maxBallNumber,
            props.defaultValues.numberOfSelectedNumbers
        );
    }

    function handleCreateNumbers(randomNumbers:boolean) {
        props.onBetChange(createBetNumbers(randomNumbers));
    }

    return (
        <div className={'lotto'}>
            <CollapsiblePanel
                isOpen={isOpen}
                onToggleIsOpenClick={isOpen => setIsDetailOpen(isOpen)}
                header={<div className={'header'}>
                    <h4>{props.message}</h4>
                    <SelectedNumbers
                        numbers={props.numbers}
                        howManyShouldBe={props.defaultValues.numberOfSelectedNumbers}
                        areAllNumbersSelected={props.areAllNumbersSelected}
                    />
                    <Buttons>
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
                    </Buttons>
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

interface ICollapsiblePanelProps {
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
            {props.isOpen && <div className={'detail'}>
                {props.detail}
            </div>}
            <div>
                <Buttons>
                    <Button
                        onClick={()=>props.onToggleIsOpenClick(!props.isOpen)}
                    >
                        {props.isOpen ? 'show less' : 'show more'}
                    </Button>
                </Buttons>
            </div>
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
                'selected' : props.selected,
                'primary' : props.variant === 'primary',
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
                'primary' : props.variant === 'primary',
            }
        )}
    >
        {props.value < 0 ? '' : props.value}
    </div>
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
                {props.allAvailableJokers.map(n => <Button
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

interface IDrawsProps {
    config: IDefaultValues,
    numberOfDraws: number,
    onDrawsClick: (numberOfDraws: number) => void
}

function Draws(props: IDrawsProps) {

    const buttons = [];
    for (let i = 1; i <= props.config.maxDraws; i++) {
        buttons.push({value: i, selected: props.numberOfDraws === i})
    }

    return (
        <div className={'box jokers'}>
            <h4>Spieldauer</h4>
            <Buttons>
                {buttons.map(b => <Button
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

interface IInfoProps {
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
    children: string | number,
    onClick?: (numberOfTimesButtonWasClicked: number) => void,
    active?: boolean,
    disabled?: boolean,
    className?: string,
    maxNumberOfMultiClick?: number,
}
function Button(props: IButtonProps) {

    function callClickAndResetButtonState(_numberOfClicks: number) {
        props.onClick && props.onClick(_numberOfClicks);
        setTriggerClick(false);
        setNumberOfClicks(0);
        setIsDropdownOpen(false);
    }

    const maxNumberOfMultiClick = props.maxNumberOfMultiClick || 1;
    let [triggerClick, setTriggerClick] = React.useState(false);
    const [numberOfClicks, setNumberOfClicks] = React.useState(0);

    function handleClick(_numberOfClicks?: number) {
        if(props.onClick == null) {
            return;
        } else if(isDropdownOpen) {
            if(_numberOfClicks) {
                callClickAndResetButtonState(_numberOfClicks);
            }
        } else if(maxNumberOfMultiClick === 1) {
            callClickAndResetButtonState(1);
        } else {
            setTriggerClick(false);
            setNumberOfClicks(numberOfClicks +1);
            setTimeout(() => {
                if(triggerClick === true) {
                    callClickAndResetButtonState(numberOfClicks);
                }
               setTriggerClick(true);
            }, 400);
        }
    }

    const options: number[] = [];
    for(let i=2;i<=maxNumberOfMultiClick; i++) {
        options.push(i);
    }

    const [isDropdownOpen, setIsDropdownOpen] = React.useState(false);

    return <button className={props.className + ' button' + (props.active ? ' active' : '')}
        disabled={props.disabled === true}
        onClick={() => handleClick()}
    >
        {props.children} {numberOfClicks > 1 ? `+ ${numberOfClicks}` : ''}
        {maxNumberOfMultiClick > 1 ? <>
            <div
                className={'selection'}
                onClick={(event: any) => {
                    event.preventDefault();
                    setIsDropdownOpen(!isDropdownOpen);
                    setNumberOfClicks(0);
                    setTriggerClick(false);
                }}
            >
                {isDropdownOpen ? '<' : '>'}
            </div>
            {isDropdownOpen && <div className={'options'}>
                <Hint>Choose how many to add</Hint>
                {options.map(o => <div
                    className={'option'}
                    onClick={() => handleClick(o)}
                >{o}</div>)}
            </div>}
        </> : ''}
    </button>
}

interface IActionsProps {
    onShowPreview: () => void;
    onPay: () => void;
    onReset: () => void;

    showPreviewButton: boolean,
    activatePayButton: boolean,
    showResetButton: boolean,

    price: number,
}

function Actions(props: IActionsProps) {
    return (
        <div className={'pay-row'}>
            <div>Total Price: {toEuro(props.price)}</div>
            <Buttons>
                <Button
                    className={'btn-preview'}
                    disabled={props.showPreviewButton}
                    onClick={props.onShowPreview}
                >
                    Show Preview
                </Button>
                {props.activatePayButton && <Button
                    className={'btn-pay'}
                    onClick={props.onPay}
                >
                    Tippabgabe
                </Button>}
                <Button
                    className={'btn-reset'}
                    active={props.showResetButton}
                    onClick={props.onReset}
                >
                    Reset
                </Button>
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

function mergeClassNames(...params: (null | undefined | string | {[key: string]: boolean})[]) {
    let classNames: string[] = [];
    params.forEach(param => {
        if(param == null) {
            // skip
        } else if(typeof param === 'string') {
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

