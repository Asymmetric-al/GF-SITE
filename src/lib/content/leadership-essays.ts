import { GF_PHOTOS } from "@/lib/brand/gf-photos";
import type { GfPhoto } from "@/lib/brand/gf-photos";

export interface LeadershipEssay {
  readonly slug: string;
  readonly legacySources: readonly string[];
  readonly title: string;
  readonly author: string;
  readonly authorRole: string;
  readonly authorHref:
    | "/our-people"
    | "/missionaries/beaumont"
    | "/missionaries/oates";
  readonly publishedDate: string;
  readonly publishedIso: string;
  readonly readTime: string;
  readonly summary: string;
  readonly photo: GfPhoto;
  readonly paragraphs: readonly string[];
}

export const LEADERSHIP_ESSAYS: readonly LeadershipEssay[] = [
  {
    author: "Don Oates",
    authorHref: "/missionaries/oates",
    authorRole: "Founder & President, Global Fellowship",
    legacySources: ["/article/Article"],
    paragraphs: [
      "When the plane landed in Liberia, West Africa, our family stepped into a world that was very foreign to us. Of course, we had been told that we would feel this way, but still it hit home immediately.",
      "Nobody looked like us or spoke like us. We felt hot, humid, and distinctly lost. Someone came up to me and said that he was there to collect us, but that he needed $20 to get our bags out of Customs. As soon as he walked away, I was pretty sure that he was not there for us. Lesson 1.",
      "We ended up sitting on our luggage as the airport shut down around us and waited pensively for our ride. Since there were no ride-hailing apps or cell phones, we simply waited patiently. Finally, we were picked up and taken to a guest house to spend a few days until we could find a flat downtown.",
      "Over the next few days, we began to get our living situation organized and tried to create some normalcy for our three small children. Yet we were a different sort of missionary. We did not move into the area where all the American missionaries lived. We were there to work alongside and under a local, indigenous leader.",
      "We had never done this before. In fact, we had recently put our real estate business on hold and offered ourselves to a mission agency that specialized in working with local Christian leaders. We had no formal schooling, language study, or preparation, a course of action we certainly do not recommend today.",
      "Yet God used our lack of preparation for his own glory. Our lack of training meant that any real progress or fruit had to come by God's own hand rather than our own knowledge or skills.",
      "Throughout our time in West Africa, God used us in lasting Kingdom work, and by the time we left, we were thoroughly convinced that God could work through anyone willing to obey. That lesson has carried us through a lifetime of ministry. Whenever we have faced an overwhelming need or obstacle, we have looked back at the many times God caused ministry to take off despite our shortcomings.",
      "Working alongside local, indigenous leaders has been our life's work, and we have seen God do remarkable things over and over again. Instead of us arriving fully prepared in Liberia, God used our years there to prepare us for a lifetime of ministry dependent on him.",
    ],
    photo: GF_PHOTOS.leaderDonKathyOates,
    publishedDate: "May 15, 2019",
    publishedIso: "2019-05-15",
    readTime: "3 min read",
    slug: "you-can-land-but-taking-off-is-gods-work",
    summary:
      "Founder Don Oates recalls landing in Liberia with three young children to serve under an indigenous church leader, the firsthand turning point behind Global Fellowship's founding in 1989.",
    title: "You Can Land, But Taking Off is God's Work",
  },
  {
    author: "Jeremy Beaumont",
    authorHref: "/missionaries/beaumont",
    authorRole: "Co-Executive Director, Global Fellowship",
    legacySources: ["/article/Article-1"],
    paragraphs: [
      "Years ago I listened to a sermon tracing suffering through every single book of the New Testament. The takeaway stayed with me: believers should neither chase suffering nor act surprised when following Jesus carries real cost. Proclaiming the Gospel where Christ is little known involves ordinary hardship and sometimes real danger.",
      "A biblical theology of suffering matters deeply for anyone serving among unreached communities. Those neighborhoods often remain without a local church precisely because faithfulness there can bring misunderstanding, opposition, or personal loss. Resting in our Father's strong hands is not abstract theory on the field; it is daily bread.",
      '"Beloved, do not be surprised at the fiery trial when it comes upon you to test you, as though something strange were happening to you. But rejoice insofar as you share Christ\'s sufferings, that you may also rejoice and be glad when his glory is revealed." (1 Peter 4:12-13, ESV)',
      "Across regions where believers are a tiny minority, local church planters and their families have faced hostility, lost homes, and still chosen to remain present with their neighbors because Christ's presence is even more real than the danger.",
      "Please pray regularly for local elders, single workers, and families who bear real hardship for the sake of Jesus Christ, asking God to guard their homes, renew their courage, and gather lasting churches in their communities.",
    ],
    photo: GF_PHOTOS.neighborhoodDusk,
    publishedDate: "October 24, 2019",
    publishedIso: "2019-10-24",
    readTime: "3 min read",
    slug: "suffering-as-a-believer-shouldnt-be-surprising",
    summary:
      "Co-Executive Director Jeremy Beaumont reflects on 1 Peter 4:12-13, why faithful witness where Christ is scarcely known carries real cost, and how churches can pray for enduring courage.",
    title: "Suffering as a Believer Shouldn't Be Surprising",
  },
  {
    author: "Anne Beaumont",
    authorHref: "/missionaries/beaumont",
    authorRole: "Global Fellowship Leadership & Family Ministry",
    legacySources: ["/article/Article-3"],
    paragraphs: [
      "One of the convictions we live out daily at Global Fellowship is family on mission. Having children while serving in global ministry is both complex and deeply joyful. We strongly believe that children are never a hindrance to ministry; they are an asset.",
      "Our children receive a front-row seat to what God is doing around the world to redeem the lost, and they often play an active part in that work themselves. Every time we travel overseas to visit and encourage missionaries, we are reminded of that truth.",
      "Young children draw people in ways adults alone never could. They encourage missionary kids in ways only fellow kids can, play with local children on the playground across language barriers, and naturally open warm conversations with parents. Back home, they set our kitchen table again and again whenever missionaries stay for dinner or a family visits to explore serving overseas.",
      "Whenever I am tempted to feel that our kids are getting in the way of serious work, I remember how clearly Jesus valued children in the Kingdom. He never underestimated their capacity to trust God or participate in what he was doing. He welcomed them and even used a young boy's lunch to feed a crowd.",
      "One day, while our team was kneeling to pray for missionaries around the world, our two-year-old walked from person to person touching their shoulders. At first I felt tempted to hurry him out of the room. Then he came beside me, knelt down, and began imitating our prayer. In that still moment, my impulse to keep little ones out was replaced by gratitude to let them stay.",
      "Does whole-family mission mean there are meetings I miss because children are squabbling in another room, or deep conversations overseas that happen while I soothe a jetlagged baby in a hotel room? Of course it does. Like every part of parenting, inviting your whole family into ministry carries real hurdles alongside deep joy. Children belong right inside God's mission, because they are the next generation carrying the Gospel forward.",
    ],
    photo: GF_PHOTOS.leaderBeaumontFamily,
    publishedDate: "March 14, 2019",
    publishedIso: "2019-03-14",
    readTime: "3 min read",
    slug: "the-value-of-family-on-mission",
    summary:
      "Anne Beaumont reflects on raising three children in global ministry, opening the family table to visiting church planters, and why children belong inside the mission of the church.",
    title: "The Value of Family on Mission",
  },
] as const;

export const findLeadershipEssayBySlug = (
  slug: string
): LeadershipEssay | null =>
  LEADERSHIP_ESSAYS.find((essay) => essay.slug === slug) ?? null;
