
export async function GET(){
  // Mock plan for MVP demo.
  const plan = { weeks: 6, targets: {
    "1": ["Pakistan Affairs: constitutional timeline (2 hrs)", "MCQs set A (30m)", "Essay outline: federalism"],
    "2": ["IR: Cold War & Pakistan alignment", "MCQs set B (30m)", "Essay outline: governance"],
    "3": ["Current Affairs: economy & energy", "Mock essay (40m)", "Revise weaknesses"],
    "4": ["Islamic Studies: ethics & governance", "MCQs set C (30m)", "Structured notes"],
    "5": ["GK: science & environment", "Past paper Qs (1 hr)", "Oral practice"],
    "6": ["Full-length mock", "Review & refine", "Interview speech prep"]
  }};
  return Response.json({ plan });
}
export async function POST(req:Request){
  const { diagnostic } = await req.json();
  // Would compute a tailored plan. For MVP echo a plan.
  return GET();
}
