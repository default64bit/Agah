<template>
    <div class="overflow-x-hidden">
        <section class="flex items-center gap-4 mx-auto my-10 sm:my-20 md:my-28 relative" name="home-1">
            <img class="absolute left-0" src="../../../assets/images/lady_justice.png" alt="lady-justice" />
            <div class="flex flex-col gap-16 p-4">
                <h1 class="f-neirizi text-5xl sm:text-6xl md:text-7xl text-center md:text-right md:mr-8">گروه وکلای آگه</h1>
                <h2 class="text-lg max-w-screen-sm">
                    ارائه دهنده خدمات حقوقی ازقبیل مشاوره حقوقی و تنظیم قرارداد درزمینه های ملکی، ارثی، خانواده و کیفری و...
                </h2>
                <div class="flex items-center flex-wrap flex-col md:flex-row gap-10 md:gap-24">
                    <router-link to="/consultation-time-booking" class="btn text-xl">رزرو وقت مشاوره</router-link>
                    <a href="tel:02166908026" class="text-xl" dir="ltr"><span class="far fa-phone-rotary"></span> 021 66908026-27</a>
                </div>
            </div>
        </section>

        <section class="flex items-center justify-evenly flex-wrap gap-10 mx-auto mt-10" name="home-2">
            <div class="p-5 m-gradiant-ttb">
                <span class="heading mb-4">
                    <h4 class="f-nazanin font-bold text-4xl">وکالت در دعاوی</h4>
                    <small class="f-copgoth text-xs">Representation In Lawsuits</small>
                </span>
                <p class="w-64">
                    ما با داشتن ده ها تجربه موفق در پرونده های حقوقی مختلف در زمینه های دعاوی کیفری، خانواده و ملکی آماده قبول پرونده دعاوی شماییم
                </p>
            </div>
            <div class="p-5 m-gradiant-ttb">
                <span class="heading mb-4">
                    <h4 class="f-nazanin font-bold text-4xl">تنظیم قرارداد</h4>
                    <small class="f-copgoth text-xs">Writing A Contract</small>
                </span>
                <p class="w-64">
                    درخواست تنظیم انواع اوراق قضایی مانند قرارداد، لایحه و شکوائیه در موضوعات مختلف و دریافت مشاوره برای بهبود و تصحیح اوراق قضایی خود
                </p>
            </div>
            <div class="p-5 m-gradiant-ttb">
                <span class="heading mb-4">
                    <h4 class="f-nazanin font-bold text-4xl">مشاوره حقوقی</h4>
                    <small class="f-copgoth text-xs">Legal Consultancy</small>
                </span>
                <p class="w-64">رزرو و دریافت مشاوره با وکلای مجرب در انواع زمینه های حقوقی به صورت تلفنی، حضوری و آنلاین</p>
            </div>
        </section>

        <hr class="max-w-screen-xl w-10/12 border-2 border-solid opacity-80 mx-auto mt-16" />

        <section class="flex flex-col items-center gap-8 mx-auto" name="home-3">
            <div class="flex flex-col items-center justify-center gap-1">
                <h3 class="f-nazanin font-bold text-5xl">مشاورین</h3>
                <small class="f-copgoth text-xs">Consulters</small>
            </div>
            <div class="flex items-start justify-evenly flex-wrap gap-8 w-full max-w-screen-md">
                <div class="consulter_card p-6 m-gradiant-btt" v-for="(consulter, i) in consulters" :key="i">
                    <img class="object-cover rounded-full w-24 h-24" :src="consulter.image" alt="" />
                    <h5 class="text-xl">{{ `${consulter.name} ${consulter.family}` }}</h5>
                    <p class="my-3 w-64 text-sm whitespace-pre-line opacity-80">{{ consulter.desc }}</p>
                    <ul class="flex items-center justify-center flex-wrap gap-4 w-full">
                        <li v-for="(socialMedia, j) in consulter.socialMedias" :key="j">
                            <a :href="socialMedia.link">
                                <span class="fab text-xl text-primary-600 hover:text-primary-700" :class="`fa-${socialMedia.name}`"></span>
                            </a>
                        </li>
                    </ul>
                    <router-link class="btn w-full" :to="`/consultation-time-booking/${consulter.name}-${consulter.family}-${consulter._id}`">
                        دریافت مشاوره
                    </router-link>
                </div>
            </div>
        </section>

        <div class="bg-wrapper py-8 my-10">
            <section class="flex flex-row-reverse items-center gap-8 mx-auto relative" name="home-4">
                <img class="absolute md:right-5" src="../../../assets/images/statue_head.png" alt="statue-head" />
                <div class="flex flex-col justify-between items-center gap-20 p-4">
                    <div class="flex flex-col items-center justify-center gap-1">
                        <h3 class="f-nazanin font-bold text-5xl">سوالات متداول حقوقی</h3>
                        <small class="f-copgoth text-xs">Frequently Asked Legal Questions</small>
                    </div>
                    <div ref="faqSlider" class="flex flex-nowrap max-w-3xl overflow-hidden">
                        <h4 class="text-lg" v-for="(faq, i) in faqSliders" :key="i" v-show="faq.active">{{ faq.text }}</h4>
                    </div>
                    <router-link to="/frequently-asked-legal-questions" class="btn w-max">مشاهده ادامه سوالات حقوقی</router-link>
                </div>
            </section>
        </div>

        <section class="flex flex-col items-center justify-center gap-8 mx-auto" name="home-5">
            <div class="flex flex-col items-center justify-center gap-1">
                <h3 class="f-nazanin font-bold text-5xl">وبلاگ</h3>
                <small class="f-copgoth text-xs">Blog</small>
            </div>
            <div class="flex items-start justify-center flex-wrap gap-10">
                <div class="article_box" v-if="!!articles[0]">
                    <router-link :to="`/article/${articles[0].url_code}/${articles[0].title.replace(/ /g, '-')}`" :title="articles[0].title">
                        <img :src="articles[0].metadata.thumbnail" :alt="articles[0].title" />
                    </router-link>
                    <router-link :to="`/article/${articles[0].url_code}/${articles[0].title.replace(/ /g, '-')}`" :title="articles[0].title">
                        <h4 class="f-nazanin text-2xl font-bold">{{ articles[0].title }}</h4>
                    </router-link>
                    <small class="flex justify-between w-full relative">
                        <span>{{ `${articles[0].author.name} ${articles[0].author.family}` }}</span>
                        <span>{{ new Date(articles[0].publishedAt).toLocaleDateString("fa") }}</span>
                    </small>
                    <p>{{ articles[0].desc }}</p>
                </div>
                <div class="article_box" v-if="!!articles[1]">
                    <router-link :to="`/article/${articles[1].url_code}/${articles[1].title.replace(/ /g, '-')}`" :title="articles[1].title">
                        <img :src="articles[1].metadata.thumbnail" :alt="articles[1].title" />
                    </router-link>
                    <router-link :to="`/article/${articles[1].url_code}/${articles[1].title.replace(/ /g, '-')}`" :title="articles[1].title">
                        <h4 class="f-nazanin text-2xl font-bold">{{ articles[1].title }}</h4>
                    </router-link>
                    <small class="flex justify-between w-full relative">
                        <span>{{ `${articles[1].author.name} ${articles[1].author.family}` }}</span>
                        <span>{{ new Date(articles[1].publishedAt).toLocaleDateString("fa") }}</span>
                    </small>
                    <p>{{ articles[1].desc }}</p>
                </div>
                <div class="flex flex-col gap-6">
                    <div class="article_box" v-if="!!articles[2]">
                        <router-link :to="`/article/${articles[2].url_code}/${articles[2].title.replace(/ /g, '-')}`" :title="articles[2].title">
                            <h4 class="f-nazanin text-2xl font-bold">{{ articles[2].title }}</h4>
                        </router-link>
                        <small class="flex justify-between w-full relative">
                            <span>{{ `${articles[2].author.name} ${articles[2].author.family}` }}</span>
                            <span>{{ new Date(articles[2].publishedAt).toLocaleDateString("fa") }}</span>
                        </small>
                    </div>
                    <div class="article_box" v-if="!!articles[3]">
                        <router-link :to="`/article/${articles[3].url_code}/${articles[3].title.replace(/ /g, '-')}`" :title="articles[3].title">
                            <h4 class="f-nazanin text-2xl font-bold">{{ articles[3].title }}</h4>
                        </router-link>
                        <small class="flex justify-between w-full relative">
                            <span>{{ `${articles[3].author.name} ${articles[3].author.family}` }}</span>
                            <span>{{ new Date(articles[3].publishedAt).toLocaleDateString("fa") }}</span>
                        </small>
                    </div>
                    <div class="article_box" v-if="!!articles[4]">
                        <router-link :to="`/article/${articles[4].url_code}/${articles[4].title.replace(/ /g, '-')}`" :title="articles[4].title">
                            <h4 class="f-nazanin text-2xl font-bold">{{ articles[4].title }}</h4>
                        </router-link>
                        <small class="flex justify-between w-full relative">
                            <span>{{ `${articles[4].author.name} ${articles[4].author.family}` }}</span>
                            <span>{{ new Date(articles[4].publishedAt).toLocaleDateString("fa") }}</span>
                        </small>
                    </div>
                    <router-link to="/blog" class="btn">مشاهده ادامه مطالب</router-link>
                </div>
            </div>
        </section>

        <section class="flex flex-col items-center justify-center gap-8 mx-auto mt-20" name="home-6">
            <div class="flex flex-col items-center justify-center gap-1">
                <h3 class="f-nazanin font-bold text-2xl">حوزه های کاری</h3>
                <small class="f-copgoth text-xs">Areas Of Work</small>
            </div>
            <div class="flex w-full max-w-3xl overflow-hidden">
                <ul class="flex gap-2 md:gap-8 flex-shrink-0">
                    <li class="p-2 px-6 md:mx-4"><strong>حقوق کار</strong></li>
                    <li class="p-2 px-6 md:mx-4"><strong>ملکی</strong></li>
                    <li class="p-2 px-6 md:mx-4"><strong>ارثی</strong></li>
                    <li class="p-2 px-6 md:mx-4"><strong>خانواده</strong></li>
                    <li class="p-2 px-6 md:mx-4"><strong>ثبتی</strong></li>
                    <li class="p-2 px-6 md:mx-4"><strong>کیفری</strong></li>
                </ul>
            </div>
        </section>

        <hr class="max-w-screen-xl w-10/12 border-2 border-solid opacity-80 mx-auto my-16" />
    </div>
</template>

<script>
import axios from "axios";

export default {
    name: "Home",
    data() {
        return {
            consulters: [],
            faqSliders: [],
            articles: [],
        };
    },
    async serverPrefetch() {
        await Promise.all([this.getConsulters(), this.getRandomFaqs(), this.getRandomArticles()]);
    },
    created() {},
    async mounted() {
        await Promise.all([this.getConsulters(), this.getRandomFaqs(), this.getRandomArticles()]);

        setInterval(() => {
            for (let i = 0; i < this.faqSliders.length; i++) {
                if (this.faqSliders[i].active) {
                    const nextKey = i == 0 ? this.faqSliders.length - 1 : i - 1;
                    this.faqSliders[nextKey].active = true;
                    this.faqSliders[i].active = false;
                    break;
                }
            }
        }, 5000);
    },
    computed: {},
    methods: {
        async getConsulters() {
            await axios.get(`${this.getBaseUrl()}/api/v1/web/consulters`).then((response) => {
                this.consulters = response.data;
            });
        },
        async getRandomFaqs() {
            await axios.get(`${this.getBaseUrl()}/api/v1/web/random_faqs`).then((response) => {
                let active = true;
                response.data.forEach((element) => {
                    if (active) active = false;
                    this.faqSliders.push({ text: element, active: active });
                });
            });
        },
        async getRandomArticles() {
            await axios.get(`${this.getBaseUrl()}/api/v1/web/random_articles`).then((response) => {
                this.articles = response.data;
            });
        },
    },
};
</script>

<style></style>
