module.exports = {
    getDateDiff: function (time) {
        let time1 = new Date(time).getTime();
        var da = new Date();
        sda = new Date(time1);
        var time2 = da.getTime();
        var time = 0;
        if (time1 > time2)
        {
            time = time1 - time2;
            sda = da;
        } else
        {
            time = time2 - time1;
        }
        if (time < 1000) return "刚刚";
        time = parseInt(time / 1000);
        if (time > 86400)
        {
            var day = parseInt(time / (24 * 60 * 60));
            if (day == 1)
            {
            return "昨天(" + sda.getHours() + ":" + sda.getMinutes() + ")";
            } else if (day < 30)
            {
            return day + "天前";
            } else if (day < 360)
            {
            var moth = parseInt(day / 30);
            return moth + "个月前";
            } else
            {
            var year = parseInt(day / 360);
            return year + "年前";
            };
        } else if (time > 3600)
        {
            var hour = parseInt(time / (60 * 60));
            return hour + "小时前";
        } else if (time > 60)
        {
            var hour = parseInt(time / 60);
            return hour + "分钟前";
        } else
        {
            return time + "秒前";
        }
    }
}