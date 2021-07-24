(() => {
    // dayjsのロケール設定
    dayjs.locale('ja');

    // 目標ポイントを計算・表示する
    const calculateTargetPoint = () => {
        const datetimeStart = $('#datetime-start').val();
        const datetimeEnd = $('#datetime-end').val();
        const targetEnd = $('#target-end').val();

        const regex = /^[0-9]{4}-(0[1-9]|1[0-2])-(0[1-9]|[12][0-9]|3[01])T([01][0-9]|2[0-3]):[0-5][0-9]$/;
        if (!regex.test(datetimeStart) || !regex.test(datetimeEnd)) {
            alert('日時は「2021-01-01T00:00」のように入力してください。');
            return;
        }
        if (!dayjs(datetimeStart).isValid() || !dayjs(datetimeEnd).isValid() || !targetEnd) {
            return;
        }

        const datetimeStartUnix = dayjs(datetimeStart).unix();
        const datetimeEndUnix = dayjs(datetimeEnd).unix();
        let endOfTodayUnix = dayjs().endOf('d').unix();
        if (endOfTodayUnix < datetimeStartUnix) {
            endOfTodayUnix = dayjs.unix(datetimeStartUnix).endOf('d').unix();
        }
        if (endOfTodayUnix > datetimeEndUnix) {
            endOfTodayUnix = datetimeEndUnix;
        }
        const nowUnix = dayjs().endOf('m').unix();
        const targetToday = Math.round((targetEnd * (endOfTodayUnix - datetimeStartUnix)) / (datetimeEndUnix - datetimeStartUnix));
        const targetNow = Math.round((targetEnd * (nowUnix - datetimeStartUnix)) / (datetimeEndUnix - datetimeStartUnix));

        $('#label-today').text(`${dayjs.unix(endOfTodayUnix).format('M/D')}の目標pt`);
        $('#target-today').text(targetToday.toLocaleString());
        $('#label-now').text(`${dayjs.unix(nowUnix).format('M/D H:mm')}の目標pt`);
        $('#target-now').text(targetNow.toLocaleString());

        if ($('#auto-save').prop('checked')) {
            save();
        }
    };

    // input要素の変更時
    $('#datetime-start').change(calculateTargetPoint);
    $('#datetime-end').change(calculateTargetPoint);
    $('#target-end').change(calculateTargetPoint);
    $('#auto-save').change(calculateTargetPoint);

    // 更新ボタン
    $('#update').click(calculateTargetPoint);

    // 保存ボタン
    const save = () => {
        const datetimeSave = dayjs().format('YYYY/M/D H:mm');

        const saveData = {
            datetimeStart: $('#datetime-start').val(),
            datetimeEnd: $('#datetime-end').val(),
            targetEnd: $('#target-end').val(),
            autoSave: $('#auto-save').prop('checked'),
            datetimeSave: datetimeSave,
        };

        localStorage.setItem(location.href, JSON.stringify(saveData));

        $('#datetime-save').text(datetimeSave);
        $('#load-save').prop('disabled', false);
        $('#clear-save').prop('disabled', false);
    };
    $('#save').click(save);

    // 入力を初期化ボタン
    const defaultInput = () => {
        $('#datetime-start').val(dayjs().subtract(15, 'h').format('YYYY-MM-DDT15:00'));
        $('#datetime-end').val(dayjs().subtract(15, 'h').add(1, 'w').format('YYYY-MM-DDT20:59'));
        $('#target-end').val(30000);
        $('#auto-save').prop('checked', false);

        calculateTargetPoint();
    };
    $('#clear-input').click(defaultInput);

    // 保存した値を読込ボタン
    const loadSavedData = () => {
        const savedString = localStorage.getItem(location.href);

        if (!savedString) {
            return false;
        }

        const savedData = JSON.parse(savedString);

        $('#datetime-start').val(savedData.datetimeStart);
        $('#datetime-end').val(savedData.datetimeEnd);
        $('#target-end').val(savedData.targetEnd);
        $('#auto-save').prop('checked', savedData.autoSave);

        calculateTargetPoint();

        $('#datetime-save').text(savedData.datetimeSave);
        $('#load-save').prop('disabled', false);
        $('#clear-save').prop('disabled', false);

        return true;
    };
    $('#load-save').click(loadSavedData);

    // 保存した値を削除ボタン
    $('#clear-save').click(() => {
        localStorage.removeItem(location.href);

        $('#datetime-save').text('削除済');
        $('#load-save').prop('disabled', true);
        $('#clear-save').prop('disabled', true);
    });

    // 画面表示時に保存した値を読込、保存した値がなければ入力の初期化
    if (!loadSavedData()) {
        defaultInput();
    }
})();
