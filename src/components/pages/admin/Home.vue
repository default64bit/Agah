<template>
    <div class="dashboard_body">
        <h1 class="text-5xl">
            <b>خوش اومدی, {{ adminInfo.name }}</b>
        </h1>

        <hr class="my-4">

        <ol class="flex flex-col gap-8">
            <li>
                <b>ریزمکالمات</b>
                <small class="flex">نمایش لیست ریزمکلمات انجام شده</small>
                <small class="flex">نمایش وضعیت مکالمه - پاسخ داده شده یا افلاین یا عدم پاسخگویی و ...</small>
            </li>
            <li>
                <b>تراکنش های مالی</b>
                <small class="flex">نمایش لیست تراکنش های مالی انجام شده کاربران</small>
                <small class="flex">با فیلتر تاریخ و وضعیت</small>
                <small class="flex">با لینک به کاربر و مشاوره خریداری شده</small>
            </li>
            <li>
                <b>ادمین ها</b>
                <small class="flex">آپدیت اطلاعات جدید ادمین در ساخت و ویرایش ادمین</small>
                <small class="flex">افزودن دسترسی های لازم</small>
                <small class="flex">ساخت قسمتی در پروفایل شخصی هر ادمین جهت تعیین وقت های آزاد</small>
                <small class="flex">وقت های مشاوره حضوری و آنلاین جدا</small>
                <small class="flex">تعیین تاریخ هایی جهت جلوگیری رزرو وقت کاربران در آن تاریخ ها</small>
                <small class="flex">تاریخ های تعطیل رسمی باید اتوماتیک درنظر گرفته شود</small>
            </li>
            <li>
                <b>کاربران</b>
                <small class="flex">نمایش لیست کاربران با امکان انتخاب یک کاربر سپس نمایش چت و جزئیات و مشاوره ها و تراکنش های کاربر در تب های مختلف</small>
            </li>
            <li>
                <b>مشاوره ها</b>
                <small class="flex">نمایش لیست تمام مشاوره های رزرو شده با وضعیت ها مختلف و امکان ویرایش و ثبت مشاوره جدید</small>
                <small class="flex">ویرایش زمان مشاوره و انتخاب زمان جدید مانند زمانی که کاربر ثبت میکند</small>
                <small class="flex">ویرایش فرد مشاور و اختصاص به مشاور دیگر</small>
                <small class="flex">ویرایش وضعیت مشاوره در صورت از دست دادن مشاوره</small>
            </li>
            <li>
                <b>تعرفه ها</b>
                <small class="flex">قسمتی برای تعیین تعرفه های مشاوره بر پایه ساعت</small>
            </li>
        </ol>
    </div>
</template>

<script>
import { mapGetters } from "vuex";

export default {
    name: "Home",
    components: {},
    data() {
        return {
            connection: "",
        };
    },
    created() {},
    mounted() {},
    computed: {
        ...mapGetters(["adminInfo"]),
    },
    methods: {},
};
</script>

<style></style>
