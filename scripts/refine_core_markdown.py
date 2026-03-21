from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
CONTENT = ROOT / "content"


REPLACEMENTS = {
    "02-pregnancy-support-lifestyle-and-nutrition.md": [
        (
            "Try to focus on: - eating nutritious foods (see Eating Well for Pregnancy) - getting regular physical activity (see Taking Care of Yourself) - finding health care providers you trust and going to prenatal care appointments (see Health Care During Pregnancy) - brushing your teeth, flossing and seeing a dental professional - quitting or reducing smoking, vaping and nicotine use - building a support team of family, friends and community members (see Your Circle of Support) - keeping immunizations up-to-date and practicing hand hygiene. To learn more see: gov.bc.ca/gov/content/covid-19/info/ response",
            "Try to focus on:\n- eating nutritious foods (see Eating Well for Pregnancy)\n- getting regular physical activity (see Taking Care of Yourself)\n- finding health care providers you trust and going to prenatal care appointments (see Health Care During Pregnancy)\n- brushing your teeth, flossing and seeing a dental professional\n- quitting or reducing smoking, vaping and nicotine use\n- building a support team of family, friends and community members (see Your Circle of Support)\n- keeping immunizations up-to-date and practicing hand hygiene\n\nTo learn more see: `gov.bc.ca/gov/content/covid-19/info/response`"
        ),
        (
            "X-rays and CT scans X-rays and CT scans may expose your baby to radiation, which could cause birth defects or growth issues. Lower the risk:",
            "**X-rays and CT scans**\n\nX-rays and CT scans may expose your baby to radiation, which could cause birth defects or growth issues.\n\nLower the risk:"
        ),
        (
            "- Before any medical or dental work, tell your technician if you’re pregnant or breastfeeding or chestfeeding. Your health care provider will recommend the safest test possible. Pets Pets, especially cats, can carry a parasite in their poop that can cause a serious infection (“toxoplasmosis”) and lead to miscarriage or birth defects. Lower the risk:",
            "- Before any medical or dental work, tell your technician if you’re pregnant or breastfeeding or chestfeeding. Your health care provider will recommend the safest test possible.\n\n**Pets**\n\nPets, especially cats, can carry a parasite in their poop that can cause a serious infection (“toxoplasmosis”) and lead to miscarriage or birth defects.\n\nLower the risk:"
        ),
        (
            "- Wash your hands well with soap and water after touching pets. Medications Many medications are safe to take during pregnancy and while breastfeeding or chestfeeding. But some – including natural remedies, traditional medicines, and prescription and non-prescription medicines, like Advil (ibuprofen) – may be unsafe during pregnancy. Using opioids (like morphine, oxycodone and fentanyl) during pregnancy can increase your risk of miscarriage, preterm birth and low birth weight. Opioid use can also cause your newborn to go through withdrawal, as can using sedatives such as Xanax, Valium and Ativan (benzodiazepines) during pregnancy. Lower the risk:",
            "- Wash your hands well with soap and water after touching pets.\n\n**Medications**\n\nMany medications are safe to take during pregnancy and while breastfeeding or chestfeeding. But some – including natural remedies, traditional medicines, and prescription and non-prescription medicines, like Advil (ibuprofen) – may be unsafe during pregnancy. Using opioids (like morphine, oxycodone and fentanyl) during pregnancy can increase your risk of miscarriage, preterm birth and low birth weight. Opioid use can also cause your newborn to go through withdrawal, as can using sedatives such as Xanax, Valium and Ativan (benzodiazepines) during pregnancy.\n\nLower the risk:"
        ),
        (
            "- Speak with an herbalist or Elder for information on the use of traditional medicines during pregnancy. Domestic violence Violence toward you puts both you and your unborn baby at risk. If your partner(s) abuses you physically, sexually, emotionally or verbally during pregnancy, your baby could also be injured. Your unborn baby may be affected by the stress you feel. After birth, even if a child doesn’t actually see the abuse, they will feel the tension and fear in the home. This can harm their development and lifelong health. Lower the risk:",
            "- Speak with an herbalist or Elder for information on the use of traditional medicines during pregnancy.\n\n**Domestic violence**\n\nViolence toward you puts both you and your unborn baby at risk. If your partner(s) abuses you physically, sexually, emotionally or verbally during pregnancy, your baby could also be injured. Your unborn baby may be affected by the stress you feel. After birth, even if a child doesn’t actually see the abuse, they will feel the tension and fear in the home. This can harm their development and lifelong health.\n\nLower the risk:"
        ),
        (
            "- Try to quit. More resources available to help you quit or smoke or vape less:",
            "- Try to quit.\n\nMore resources available to help you quit or smoke or vape less:"
        ),
        (
            "- First Nations Health Authority Resources: – FNHA Quitting Commercial Tobacco fnha.ca/Documents/FNHA-Quitting- Commercial-Tobacco-FAQs.pdf – FNHA Respecting Tobacco fnha.ca/respectingtobacco",
            "- First Nations Health Authority Resources:\n  - FNHA Quitting Commercial Tobacco: `fnha.ca/Documents/FNHA-Quitting-Commercial-Tobacco-FAQs.pdf`\n  - FNHA Respecting Tobacco: `fnha.ca/respectingtobacco`"
        ),
        (
            "- Call the Alcohol & Drug Information Referral Service (ADIRS) anytime, day or night, for free, confidential information: 1-604-660-9382 (lower mainland) or 1-800-663-1441 (anywhere in B.C.). Nicotine or commercial tobacco Using nicotine or commercial tobacco can increase the risk of miscarriage, stillbirth, preterm birth, low birth weight and sleep-related infant death. The harms of using nicotine or commercial tobacco are equal no matter how it is used – smoking, vaping or chewing. It is also important to know that exposure to second-hand smoke from nicotine or commercial tobacco is harmful. Exposure to smoke and third hand smoke after birth can reduce your milk supply and puts your baby at much higher risk of sleep-related infant death, ear infections, asthma and bronchitis. It can also increase the chance that your child will become a smoker.",
            "- Call the Alcohol & Drug Information Referral Service (ADIRS) anytime, day or night, for free, confidential information: `1-604-660-9382` (lower mainland) or `1-800-663-1441` (anywhere in B.C.).\n\n**Nicotine or commercial tobacco**\n\nUsing nicotine or commercial tobacco can increase the risk of miscarriage, stillbirth, preterm birth, low birth weight and sleep-related infant death. The harms of using nicotine or commercial tobacco are equal no matter how it is used – smoking, vaping or chewing. It is also important to know that exposure to second-hand smoke from nicotine or commercial tobacco is harmful. Exposure to smoke and third hand smoke after birth can reduce your milk supply and puts your baby at much higher risk of sleep-related infant death, ear infections, asthma and bronchitis. It can also increase the chance that your child will become a smoker."
        ),
        (
            "Focus on: - enjoying a variety of healthy foods from the 3 groupings of food – vegetables and fruits, whole grain foods and proteins - eating 3 meals and 2 or 3 snacks each day - choosing foods with healthy fats like nuts, seeds, fatty fish and vegetable oils, instead of saturated fats - trusting your body and hunger to guide you in how much to eat – your body needs a little more food each day - drinking water as your main choice Highly processed and prepared foods and drinks that are high in saturated fat, sugar and sodium – like chips, cakes and pop – don’t have the nutrients your growing baby needs. Choose these foods and drinks less often.",
            "Focus on:\n- enjoying a variety of healthy foods from the 3 groupings of food – vegetables and fruits, whole grain foods and proteins\n- eating 3 meals and 2 or 3 snacks each day\n- choosing foods with healthy fats like nuts, seeds, fatty fish and vegetable oils, instead of saturated fats\n- trusting your body and hunger to guide you in how much to eat – your body needs a little more food each day\n- drinking water as your main choice\n\nHighly processed and prepared foods and drinks that are high in saturated fat, sugar and sodium – like chips, cakes and pop – don’t have the nutrients your growing baby needs. Choose these foods and drinks less often."
        ),
    ],
    "03-pregnancy-self-care-health-and-risks.md": [
        (
            "Staying physically active during pregnancy can help you:\n- prepare your body for labour and birth\n- improve your mood and your energy level\n- cut down on backache and constipation\n- lower your risk of gestational diabetes\n- sleep better Try these: - walking - riding a stationary bike - swimming or aquafit - low-impact aerobics or prenatal fitness classes - prenatal yoga - canoeing - fishing Stay safe when exercising - Don’t lie flat on your back if doing so makes you feel light-headed or nauseated. - Don’t hold your breath. Breathe out on exertion and in when you relax. - Use light weights, resistance bands and body weight. - Drink water before, during and after activity. - Stretch comfortably and do gentle warm-ups and cool-downs before and after exercise. - Get Active Questionnaire for Pregnancy. csep.ca/2021/05/27/get-activequestionnaire-for-pregnancy/",
            "Staying physically active during pregnancy can help you:\n- prepare your body for labour and birth\n- improve your mood and your energy level\n- cut down on backache and constipation\n- lower your risk of gestational diabetes\n- sleep better\n\nTry these:\n- walking\n- riding a stationary bike\n- swimming or aquafit\n- low-impact aerobics or prenatal fitness classes\n- prenatal yoga\n- canoeing\n- fishing\n\nStay safe when exercising:\n- Don’t lie flat on your back if doing so makes you feel light-headed or nauseated.\n- Don’t hold your breath. Breathe out on exertion and in when you relax.\n- Use light weights, resistance bands and body weight.\n- Drink water before, during and after activity.\n- Stretch comfortably and do gentle warm-ups and cool-downs before and after exercise.\n- Get Active Questionnaire for Pregnancy: `csep.ca/2021/05/27/get-activequestionnaire-for-pregnancy/`"
        ),
        (
            "Staying active doesn’t have to be about going to the gym. You can keep your body moving with day-to-day activities like taking the stairs, raking leaves or getting off the bus one stop away and walking the rest of the way to work. Don’t try these: - activities involving bouncing or fast changes in direction, such as squash and racquetball, for example, can cause ligament injuries more easily when you’re pregnant - contact sports, such as karate and any activities where you’re likely to fall, like skiing, should be avoided since balance becomes harder during pregnancy - activities that will overheat you, like hot yoga or swimming in pools warmer than 28°C (82°F) - scuba diving",
            "Staying active doesn’t have to be about going to the gym. You can keep your body moving with day-to-day activities like taking the stairs, raking leaves or getting off the bus one stop away and walking the rest of the way to work.\n\nDon’t try these:\n- activities involving bouncing or fast changes in direction, such as squash and racquetball, for example, can cause ligament injuries more easily when you’re pregnant\n- contact sports, such as karate and any activities where you’re likely to fall, like skiing, should be avoided since balance becomes harder during pregnancy\n- activities that will overheat you, like hot yoga or swimming in pools warmer than 28°C (82°F)\n- scuba diving"
        ),
        (
            "- dizziness or faintness If you don’t feel better after resting, contact your health care provider or HealthLink BC at 8-1-1. Contact Physical Activity Services at HealthLink BC for physical activity support during and after pregnancy. Call 8-1-1 or refer to this link for more information: healthlinkbc.ca/health-services/healthlinkbc-811-services/physical-activity-services",
            "- dizziness or faintness\n\nIf you don’t feel better after resting, contact your health care provider or HealthLink BC at `8-1-1`.\n\nContact Physical Activity Services at HealthLink BC for physical activity support during and after pregnancy. Call `8-1-1` or refer to this link for more information: `healthlinkbc.ca/health-services/healthlinkbc-811-services/physical-activity-services`"
        ),
        (
            "If you were active before pregnancy, continue your physical activity routine but listen to your body. If you don’t have an exercise routine, start gradually, with 15 minutes (including breaks), 3 times a week. Physical activity after the birth Physical activity can help you boost your mood and energy, help with postpartum depression and anxiety, improve your sleep and strengthen your heart, lungs, muscles and bones. If you had a caesarean, talk with your health care provider about when you can start. If you had a healthy pregnancy and gave birth vaginally, get active again as soon as you’re comfortable. Whatever activity you do, start slowly. Physical activity and breastfeeding or chestfeeding In rare cases, intense exercise can change the taste of your milk. If your baby doesn’t feed as well after you exercise, feed them beforehand. Or pump milk before you work out.",
            "If you were active before pregnancy, continue your physical activity routine but listen to your body. If you don’t have an exercise routine, start gradually, with 15 minutes (including breaks), 3 times a week.\n\n**Physical activity after the birth**\n\nPhysical activity can help you boost your mood and energy, help with postpartum depression and anxiety, improve your sleep and strengthen your heart, lungs, muscles and bones. If you had a caesarean, talk with your health care provider about when you can start. If you had a healthy pregnancy and gave birth vaginally, get active again as soon as you’re comfortable. Whatever activity you do, start slowly.\n\n**Physical activity and breastfeeding or chestfeeding**\n\nIn rare cases, intense exercise can change the taste of your milk. If your baby doesn’t feed as well after you exercise, feed them beforehand. Or pump milk before you work out."
        ),
        (
            "Some stress is to be expected, but too much can be unhealthy for you and your baby. To help balance your stress, try: - talking with a professional or someone else you trust - saying no to extra responsibilities - making time for yourself - practising healthy eating - being physically active - making sleep a priority - practising relaxation breathing - building a support system and making friends with other parents and caregivers - taking prenatal classes If you have a sudden crisis, talk with your health care provider or call HealthLink BC at 8-1-1.",
            "Some stress is to be expected, but too much can be unhealthy for you and your baby. To help balance your stress, try:\n- talking with a professional or someone else you trust\n- saying no to extra responsibilities\n- making time for yourself\n- practising healthy eating\n- being physically active\n- making sleep a priority\n- practising relaxation breathing\n- building a support system and making friends with other parents and caregivers\n- taking prenatal classes\n\nIf you have a sudden crisis, talk with your health care provider or call HealthLink BC at `8-1-1`."
        ),
        (
            "Perinatal depression and anxiety can affect both you and your partner(s). Help is\n\n**available. See Your Emotional Health.DID YOU KNOW?**",
            "Perinatal depression and anxiety can affect both you and your partner(s). Help is available. See _Your Emotional Health_.\n\n**DID YOU KNOW?**"
        ),
    ],
}


def main() -> None:
    for filename, replacements in REPLACEMENTS.items():
        path = CONTENT / filename
        text = path.read_text(encoding="utf-8")
        for old, new in replacements:
            text = text.replace(old, new)
        path.write_text(text, encoding="utf-8")


if __name__ == "__main__":
    main()
