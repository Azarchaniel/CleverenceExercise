import React, {useRef, useState} from 'react';
import {
    Checkbox,
    DatePicker,
    DayOfWeek,
    DefaultButton,
    Dropdown,
    FontWeights, IDatePicker,
    IDatePickerStrings,
    IDropdownOption,
    IDropdownStyles,
    Stack,
    Text,
    TextField
} from 'office-ui-fabric-react';
import Snackbar from '@material-ui/core/Snackbar';
import MuiAlert from '@material-ui/lab/Alert';

function Alert(props: any) {
    return <MuiAlert elevation={6} variant="filled" {...props} />;
}

// STYLES
const boldStyle = {
    root: {fontWeight: FontWeights.semibold}
};

const dropdownStyles: Partial<IDropdownStyles> = {
    dropdown: {width: 335},
};

// INTERFACES
interface IForm {
    firstName: string,
    lastName: string,
    email: string,
    birthDate: Date | undefined,
    region: IDropdownOption | undefined,
    readUnderstood: boolean
}

interface IError {
    email: string,
    //birthday: string
}

interface IToast {
    open: boolean,
    message: string
}

// MAIN
export const App: React.FunctionComponent = () => {
    //INIT STATES
    const formInit: IForm = {
        firstName: '',
        lastName: '',
        email: '',
        birthDate: undefined,
        region: undefined,
        readUnderstood: false
    };

    //todo: here sould be also birthday, or more
    const errorInit: IError = {
        email: ''
    };

    const toastInit: IToast = {
        open: false,
        message: ''
    }

    //STATES
    const [error, setError] = useState<IError>(errorInit);
    const [form, setForm] = useState<IForm>(formInit);
    const [jsonRes, setJsonRes] = useState('');
    const [date, setDate] = useState<Date | undefined>();
    const [toast, setToast] = useState<IToast>(toastInit);
    const datePickerRef = useRef<IDatePicker>(null);

    //handle close of Toast
    const handleClose = (event: any, reason: any) => {
        if (reason === 'clickaway') {
            return;
        }
        setToast({...toast, open: false});
    };

    /** run over every prop in error obj and if its length is greater than 0,
     * it means, that there is error in form
     */
    const checkForErrors = () => {
        let errorExists = false;
        Object.entries(error).forEach(([key, value]) => {
            if (value && value.length > 0) {
                errorExists = true
            }
        });
        return errorExists;
    }

    /**
     * take form as object and create string from it. Then push it to TextField
     */
    const exportJson = () => {
        if (checkForErrors()) {
            setToast({message: `Ve formuláři je chyba: ${error.email}`, open: true});
            return;
        } //error msg
        setJsonRes(JSON.stringify(form));
        setForm(formInit);
    }

    /**
     *  If JSON is not valid, end fnc
     *  Else parse JSON and set values to form
     */
    const importJson = () => {
        if (!isJsonValid(jsonRes)) return;
        setForm(JSON.parse(jsonRes));
    }

    /**
     * Check, if JSON is valid. It just check if after parse is there any parsed JSON and if it is valid object
     * Else show Toast
     * @param jsonToCheck
     */
    const isJsonValid = (jsonToCheck: string) => {
        try {
            let parsedJson = JSON.parse(jsonToCheck);
            return !!(parsedJson && typeof parsedJson === "object");
        } catch (err) {
            setToast({message: `Vložený JSON není validní!`, open: true});
        }
    }

    /**
     * If it is Event, take value from e.target
     * Some elements sends also second paramater where value is.
     * This need to polished, but no time..
     * @param e
     * @param item
     */
    const handleForm = (e: React.FormEvent<HTMLElement | HTMLInputElement> | undefined, item?: any): void => {
        if (e) {
            if (item) {
                setForm({
                    ...form,
                    [(e.target as HTMLTextAreaElement).id]: item ? (item.key ? item.key : item) : undefined
                })
            } else {
                setForm({...form, [(e.target as HTMLTextAreaElement).id]: (e.target as HTMLTextAreaElement).value})
            }
        }
    }

    const selectDate = (dateInput: Date | null | undefined) => {
        setDate(dateInput ? dateInput : undefined);
        setForm({...form, birthDate: dateInput ? dateInput : undefined})
    }

    /**
     * If date is inserted as a string, parse it to Date
     */
    const onParseDateFromString = React.useCallback(
        (newValue: string): Date => {
            const previousValue = form.birthDate || new Date();
            const newValueParts = (newValue || '').trim().split('.');
            const day =
                newValueParts.length > 0 ? Math.max(1, Math.min(31, parseInt(newValueParts[0], 10))) : previousValue.getDate();
            const month =
                newValueParts.length > 1
                    ? Math.max(1, Math.min(12, parseInt(newValueParts[1], 10))) - 1
                    : previousValue.getMonth();
            let year = newValueParts.length > 2 ? parseInt(newValueParts[2], 10) : previousValue.getFullYear();
            if (year < 100) {
                year += previousValue.getFullYear() - (previousValue.getFullYear() % 100);
            }
            setDate(new Date(year, month, day));
            setForm({...form, birthDate: form.birthDate})
            return new Date(year, month, day);
        },
        [date],
    );

    /**
     * Too simple regex check to check if email is valid
     * @param e
     */
    const validateEmail = (e: any): void => {
        if (e.target.value && !/^\S+@\S+$/.test(e.target.value)) {
            setError({...error, email: 'Zadejte validní email!'});
        } else {
            setError({...error, email: ''});
        }
        handleForm(e);
    }

    //todo: I didnt find a way how to show error in DatePicker
    /*const validateBirthDate = (e: any): void => {
        console.log('validate', (new Date(parseDate(e.target.value)) < new Date()));
        if (e.target.value && (new Date(parseDate(e.target.value)) < new Date())) {
            console.log('ERRRR');
            setError({...error, birthday: 'Datum narození musí být v minulosti!'});
        } else {
            console.log('not err');
            setError({...error, birthday: ''});
        }
    }

    const parseDate = (date: string): Date => {
        //todo: this is not DRY
        const newValueParts = (date || '').trim().split('.');
        const day = Math.max(1, Math.min(31, parseInt(newValueParts[0], 10)));
        const month = Math.max(1, Math.min(12, parseInt(newValueParts[1], 10))) - 1;
        let year = parseInt(newValueParts[2], 10);
        return new Date(day, month, year);
    }*/

    /**
     * Options for Dropdown/select
     */
    const regionOptions: IDropdownOption[] = [
        {key: 'praha', text: 'Hlavní město Praha'},
        {key: 'stredocesky', text: 'Středočeský kraj'},
        {key: 'jihocesky', text: 'Jihočeský kraj'},
        {key: 'plzensky', text: 'Plzeňský kraj'},
        {key: 'ustecky', text: 'Ústecký kraj'},
        {key: 'jihomoravsky', text: 'Jihomoravský kraj'},
        {key: 'zlinsky', text: 'Zlínský kraj'},
        {key: 'moravskoslezsky', text: 'Moravskoslezský kraj'},
    ];

    /**
     * locale for datePicker
     */
    const dayPickerStrings: IDatePickerStrings = {
        months: [
            'leden',
            'únor',
            'březen',
            'duben',
            'květen',
            'červen',
            'červenec',
            'srpen',
            'září',
            'říjen',
            'listopad',
            'prosinec'
        ],
        shortMonths: ['led', 'úno', 'bře', 'dub', 'kvě', 'čvn', 'čvc', 'srp', 'zář', 'říj', 'lis', 'pro'],
        days: ['neděle', 'pondělí', 'úterý', 'středa', 'čtvrtek', 'pátek', 'sobota'],
        shortDays: ['ne', 'po', 'út', 'st', 'čt', 'pá', 'so'],
        goToToday: 'Přejít na dnešek',
        //invalidInputErrorMessage: error.birthday
    };

    return (
        <>
            <Stack
                horizontalAlign="start"
                verticalAlign="center"
                verticalFill
                styles={{
                    root: {
                        width: '1500px',
                        margin: '0 auto',
                        textAlign: 'left',
                        color: '#605e5c'
                    }
                }}
                gap={15}
            >
                <Stack horizontal horizontalAlign="start" verticalAlign="center" gap={15}>
                    <img src="https://avatars.githubusercontent.com/u/6682674?s=100&v=4" alt="logo"/>
                    <Text variant="xxLarge" styles={boldStyle}>
                        Cleverence Exercise
                    </Text>
                </Stack>

                <Stack horizontal gap={15} horizontalAlign="stretch">
                    <Stack.Item>
                        <TextField label="Jméno" id="firstName" onChange={handleForm} value={form.firstName}
                                   style={{width: 160}}/>
                    </Stack.Item>
                    <Stack.Item>
                        <TextField label="Příjmení" id="lastName" onChange={handleForm} value={form.lastName}
                                   style={{width: 160}}/>
                    </Stack.Item>
                </Stack>
                <Stack horizontal gap={15} horizontalAlign="start">
                    {/* to improve: not really good regex for email, but KISS for now */}
                    <TextField label="E-mail"
                               id="email"
                               errorMessage={error.email}
                               onBlur={validateEmail}
                               onChange={handleForm}
                               value={form.email}
                               style={{width: 160}}
                    />
                    <DatePicker label="Datum narození" strings={dayPickerStrings} firstDayOfWeek={DayOfWeek.Monday}
                                id="birthDate"
                                componentRef={datePickerRef}
                                value={form.birthDate}
                                onSelectDate={selectDate}
                                allowTextInput
                                parseDateFromString={onParseDateFromString}
                                formatDate={(date?: Date): string => {
                                    date = typeof date === "string" ? new Date(date) : date;
                                    return !date ? '' : (date.getDate() + '.' + (date.getMonth() + 1) + '.' + (date.getFullYear()))
                                }}
                                style={{width: 160}}
                        //onBlur={validateBirthDate}
                    />
                </Stack>
                <Stack horizontal gap={15} horizontalAlign="start">
                    <Dropdown
                        placeholder="Vyberte kraj z ponuky"
                        label="Kraj"
                        id="region"
                        options={regionOptions}
                        styles={dropdownStyles}
                        onChange={handleForm}
                    />
                </Stack>
                <Stack>
                    <Checkbox label="Četl a porozuměl jsem" id="readUnderstood" onChange={handleForm}
                              checked={form.readUnderstood}/>
                </Stack>

                <Stack horizontal gap={15}>
                    <DefaultButton text="Uložit" onClick={exportJson} allowDisabledFocus style={{width: 160}}/>
                    <DefaultButton text="Načíst" onClick={importJson} allowDisabledFocus style={{width: 160}}/>
                </Stack>

                <Stack horizontal>
                    <TextField id="json"
                               multiline
                               autoAdjustHeight
                               value={jsonRes}
                               onChange={(e) => setJsonRes((e as any).target.value)}
                               style={{width: 335}}
                    />
                </Stack>

            </Stack>
            <Snackbar open={toast.open} autoHideDuration={6000} onClose={handleClose}>
                <Alert onClose={handleClose} severity="error">
                    {toast.message}
                </Alert>
            </Snackbar>
        </>
    );
};
