import * as React from 'react';

import Typography from '@material-ui/core/Typography';
import { useState, useEffect } from 'react';
import { Box, Card, CardContent, TextField, Button, MenuItem, Grid, Table, TableBody, TableCell, TableContainer, TableRow, Paper, tableCellClasses } from '@mui/material';
import AddBoxIcon from '@mui/icons-material/AddBox';
import IconButton from '@mui/material/IconButton';
import EditIcon from '@mui/icons-material/Edit';
import CancelSharpIcon from '@mui/icons-material/CancelSharp';
import DeleteForeverIcon from '@mui/icons-material/DeleteForever';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import HourglassBottomIcon from '@mui/icons-material/HourglassBottom';
import { styled } from '@mui/material/styles';
import { API } from "../config/axiosConfig.jsx";


import TriggerModal from './TriggerModal.jsx';
import { ArraysState } from '../utils/utils.jsx';
import { toast } from 'react-toastify';

const styles = {
    container: {
        marginBottom: "1rem",
        minWidth: "300px",
        minHeight: "100px",
        maxWidth: "30rem",
    },
    details: {
        alignContent: "center",
    }
}

const StyledTableCell = styled(TableCell)(({ theme }) => ({
    [`&.${tableCellClasses.head}`]: {
        backgroundColor: theme.palette.common.black,
        color: theme.palette.common.white,
    },
    [`&.${tableCellClasses.body}`]: {
        fontSize: "0.75rem",
    },
    borderBottomWidth: 0,
    // borderBottomColor: theme.palette.primary.main,
}));

const StyledTableRow = styled(TableRow)(({ theme }) => ({
    borderBottomColor: theme.palette.primary.main,
    '&:nth-of-type(odd)': {
        backgroundColor: theme.palette.action.hover,
    },
    '&:last-child td, &:last-child th': {
        border: 0,
    },
}));

function SignalComponent({ signal, isEdit = false, isCreate = false, onSubmit, onCancel, symbols }) {
    const [{ data: createSignalData, loading: createSignalLoading, error: createSignalError }, createSignalExecute] = API.useCryptoApi({
        url: "/api/signals",
        method: "POST"
    },
        { manual: true }
    )
    const [{ data: editSignalData, loading: editSignalLoading, error: editSignalError }, editSignalExecute] = API.useCryptoApi({
        url: "/api/signals",
        method: "PUT"
    },
        { manual: true }
    )

    const [sides, setSides] = useState([{ label: "Long", value: true }, { label: "Short", value: false }]);

    const [isSignalEdit, setIsSignalEdit] = useState(isEdit);
    const [isSignalCreate, setIsSignalCreate] = useState(isCreate);
    const [isTriggerModalOpen, setIsTriggerModalOpen] = useState(false);

    const [triggerToEdit, setTriggerToEdit] = useState({});
    const [isEditTrigger, setIsEditTrigger] = useState(false);

    const [id, setId] = useState(-1);
    const [leverage, setLeverage] = useState(1);
    const [symbol, setSymbol] = useState(symbols[0]);
    const [isLong, setIsLong] = useState(true);
    const [channel, setChannel] = useState("");
    const [triggers, setTriggers] = useState([]);

    useEffect(() => {
        bindSignalStateFields(signal);
    }, [signal])

    useEffect(() => {
        if (!createSignalLoading && createSignalData) {
            onSubmit(createSignalData);
            toast.success("Signal saved")
            console.info('Signal saved', createSignalData);
        }
    }, [createSignalLoading, createSignalData, onSubmit]);

    useEffect(() => {
        if (createSignalError) {
            toast.error(createSignalError.message);
        }
    }, [createSignalError]);


    const bindSignalStateFields = (signal) => {
        if (!signal) return;
        if (signal.id)
            setId(signal.id)
        if (signal.leverage)
            setLeverage(signal.leverage)
        if (signal.symbol)
            setSymbol(signal.symbol)
        if (signal.isLong)
            setIsLong(signal.isLong)
        if (signal.channel)
            setChannel(signal.channel)
        if (signal.triggers)
            setTriggers(signal.triggers)

        console.debug("signal bound", signal)
    }

    const submit = () => {
        if (isSignalCreate) {
            onCreateSignalSubmit();
        } else if (isSignalEdit) {
            onEditSignalSubmit()
        } else {
            console.error("isCreate or isEdit should be true");
        }
    }

    const onCreateSignalSubmit = () => {
        const signal = {
            symbol: symbol,
            leverage: leverage,
            isLong: isLong,
            channel: channel,
            triggers: triggers,
        };
        console.info("Sending create signal request", signal);
        createSignalExecute({ data: { ...createSignalData, data: signal } })
    }

    const onEditSignalSubmit = () => {
        const editedSignal = {
            id: id,
            symbol: symbol,
            triggers: triggers,
        };
        toast.warn("todo send PUT");
        setIsSignalEdit(false)
        onSubmit(editedSignal);
    }

    const onSignalCancel = () => {
        if (isSignalCreate) {
            onCancel();
        } else if (isSignalEdit) {
            setIsSignalEdit(false)
        } else {
            console.log("onSignalCancel Tried to press cancel button while form was neither in edit or create")
        }
    }

    const onSignalEdit = () => {
        if (!isSignalEdit) {
            setIsSignalEdit(true);
        } else if (isSignalCreate) {
            onCancel();
        } else {
            console.log("onSignalEdit Tried to press cancel button while form was neither in edit or create")
        }
    }

    const onTriggerSubmit = (trigger) => {
        console.debug("onTriggerSubmit", trigger);
        setIsTriggerModalOpen(false);
    }

    const onTriggerCreate = (isEntry) => {
        const trigger = {
            isEntry: isEntry
        }
        setTriggerToEdit(trigger);
        setIsEditTrigger(false);
        setIsTriggerModalOpen(true);
        console.debug("onTriggerCreate", trigger);
    }

    const onTriggerEdit = (trigger) => {
        // todo send PUT trigger
        setTriggerToEdit(trigger);
        setIsEditTrigger(true);
        setIsTriggerModalOpen(true);
        console.debug("onTriggerEdit", trigger);
    }

    const onTriggerCancel = () => {
        setIsTriggerModalOpen(false);
    }

    const onTriggerDelete = (trigger) => {
        // todo SEND trigger DELETE
        ArraysState.remove(setTriggers, trigger);
        console.debug("onTriggerDelete", trigger);
    }

    return (
        <Card variant="outlined" sx={styles.container} key="signal-component">
            <CardContent sx={styles.details} >
                <Grid sx={{ direction: "column", justifyContent: "space-between" }}>
                    <ActionsBar />
                    <Box component="div" marginBottom="1rem">
                        <TextField
                            label="Currency"
                            select
                            sx={{ margin: "0 1rem", minWidth: "100px" }}
                            variant="standard"
                            disabled={!isSignalCreate}
                            value={symbol}
                            onChange={(e) => setSymbol(e.target.value)}>
                            {symbols.map(symbol => (
                                <MenuItem key={symbol} value={symbol}>
                                    {symbol}
                                </MenuItem>
                            ))}
                        </TextField>
                        <TextField
                            label="Side"
                            select
                            sx={{ margin: "0 1rem" }}
                            variant="standard"
                            disabled={!isSignalCreate}
                            value={isLong}
                            onChange={(e) => setIsLong(e.target.value)}>
                            {sides.map(isLong => (
                                <MenuItem key={isLong.label} value={isLong.value}>
                                    {isLong.label}
                                </MenuItem>
                            ))}
                        </TextField>
                        <TextField
                            label="Leverage"
                            sx={{ margin: "0 1rem", maxWidth: "5rem" }}
                            variant="standard"
                            disabled={!isModify()}
                            value={leverage}
                            onChange={(e) => setLeverage(e.target.value)}>
                        </TextField>
                        <TextField
                            label="Channel"
                            sx={{ margin: "0 1rem" }}
                            variant="standard"
                            disabled={!isModify()}
                            value={channel}
                            onChange={(e) => setChannel(e.target.value)}>
                        </TextField>
                    </Box>
                    {!isSignalCreate && <EntrySection />}
                    {!isSignalCreate && <ExitSection />}
                    {isModify() && <SaveButton />}
                    <TriggerModal
                        signal={signal}
                        trigger={triggerToEdit}
                        isOpen={isTriggerModalOpen}
                        isEdit={isEditTrigger}
                        onSubmit={onTriggerSubmit}
                        onCancel={onTriggerCancel} />
                </Grid>
            </CardContent>
        </Card>
    );

    function ActionsBar() {
        return <Grid sx={{ direction: "row", justifyContent: "space-between", display: "flex" }}>
            <Box sx={{ textAlign: "left", paddingLeft: "1rem" }} component="span">
                {(id >= 0) && <TextField
                    label="#"
                    component="span"
                    variant="standard"
                    sx={{ width: "2rem" }}
                    value={id}
                    disabled>
                </TextField>}
            </Box>
            <Box sx={{ textAlign: "right" }} component="span">
                {isModify() ?
                    <Box component="span" sx={{ justifyContent: "flex-end", alignItems: "center" }}>
                        {isSignalEdit &&
                            <IconButton onClick={onSignalCancel} color="error">
                                <DeleteForeverIcon />
                            </IconButton>}
                        <IconButton onClick={onSignalCancel} color="primary">
                            <CancelSharpIcon />
                        </IconButton>
                    </Box>
                    :
                    <IconButton onClick={onSignalEdit} color="primary">
                        <EditIcon />
                    </IconButton>}
            </Box>
        </Grid>;
    }

    function EntrySection() {
        const entries = triggers.filter(t => t.isEntry);
        return <>
            <Grid display="flex" flexDirection="row" alignItems="center">
                <Typography variant="h6" component="h2">
                    Entry
                </Typography>
                <IconButton onClick={() => onTriggerCreate(true)} color="primary">
                    <AddBoxIcon />
                </IconButton>
            </Grid>
            {entries.length > 0 &&
                <TableContainer component={Paper} sx={{ marginBottom: "0.5rem", padding: "0.25rem" }}>
                    <Table size="small" >
                        <TableBody>
                            {entries.map(assembleTrigger)}
                        </TableBody>
                    </Table>
                </TableContainer>
            }
        </>;
    }

    function ExitSection() {
        const exits = triggers.filter(t => !t.isEntry);
        return <>
            <Grid display="flex" flexDirection="row" alignItems="center">
                <Typography variant="h6" component="h2">
                    Exit
                </Typography>
                <IconButton onClick={() => onTriggerCreate(false)} color="primary">
                    <AddBoxIcon />
                </IconButton>
            </Grid>
            {exits.length > 0 &&
                <TableContainer component={Paper} sx={{ marginBottom: "0.5rem", padding: "0.25rem" }}>
                    <Table size="small" aria-label="a dense table" >
                        <TableBody>
                            {exits.map(assembleTrigger)}
                        </TableBody>
                    </Table>
                </TableContainer>
            }
        </>;
    }

    function SaveButton() {
        return <Box component="div" display="flex" justifyContent="right">
            <Button
                variant="contained"
                endIcon={<AddBoxIcon />}
                disabled={!isModify()}
                onClick={submit}>
                Save
            </Button>
        </Box>;
    }

    function assembleTrigger(trigger) {
        const executionTime = new Date(trigger.executionTime);
        // date format 2021-11-04 00:00
        const executionTimeString = `${executionTime.getFullYear()}-${executionTime.getMonth() + 1}-${executionTime.getDate()} ${executionTime.getHours()}:${executionTime.getMinutes()}`;

        return (
            <StyledTableRow
                key={trigger.id}>
                <StyledTableCell scope="row" width="0.5rem">
                    <ExecutedIcon />
                </StyledTableCell>
                <StyledTableCell scope="row">
                    {trigger.isMarket ? "Market" : "Limit"}@{trigger.price}
                </StyledTableCell>
                {isModify() &&
                    <StyledTableCell align="right" scope="row">
                        <Box component="span">
                            <IconButton onClick={() => onTriggerEdit(trigger)} color="primary" >
                                <EditIcon />
                            </IconButton>
                            <IconButton color="error" onClick={() => onTriggerDelete(trigger)} >
                                <DeleteForeverIcon />
                            </IconButton>
                        </Box>
                    </StyledTableCell>
                }
            </StyledTableRow>
        )

        function ExecutedIcon() {
            return <Box component="span" marginRight="1rem">
                {trigger.executed ?
                    <CheckCircleIcon color="success" />
                    :
                    <HourglassBottomIcon color="warning" />
                }
            </Box>;
        }
    }

    function isModify() {
        return isSignalEdit || isSignalCreate;
    }
}

export default SignalComponent;
