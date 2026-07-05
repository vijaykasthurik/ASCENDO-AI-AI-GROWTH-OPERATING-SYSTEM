from fastapi import APIRouter, Depends, File, Form, HTTPException, UploadFile, status

from app.api.deps import get_current_user
from app.models.user import UserPublic
from app.services import billing_service, project_service

router = APIRouter(tags=["upload"])

# Text-ish files we can safely decode and fold into the README; anything else
# (PDF, DOCX, images, ...) is skipped rather than mis-decoded as garbage text.
_TEXT_EXTENSIONS = (".txt", ".md", ".csv", ".json")


def _compose_markdown(
    *,
    name: str,
    business_type: str,
    industry: str,
    revenue: str,
    products: str,
    services: str,
    customers: str,
    employees: str,
    goals: str,
    challenges: str,
    problems: str,
    target_market: str,
    business_description: str,
    decision_query: str,
    website_url: str,
    file_sections: list[str],
) -> str:
    """Builds the business README markdown directly from onboarding form
    fields, standing in for the (unavailable) external ingestion service.
    """
    lines = [f"# {name}"]

    fields = [
        ("Business Type", business_type),
        ("Industry", industry),
        ("Website", website_url),
        ("Monthly Revenue", revenue),
        ("Products", products),
        ("Services", services),
        ("Customers", customers),
        ("Employees", employees),
        ("Target Market", target_market),
        ("Primary Goals", goals),
        ("Challenges", challenges),
        ("Problems", problems),
        ("Key Decision Query", decision_query),
    ]
    present_fields = [(label, value) for label, value in fields if value.strip()]
    if present_fields:
        lines.append("\n## Business Profile\n")
        lines.extend(f"- **{label}:** {value.strip()}" for label, value in present_fields)

    if business_description.strip():
        lines.append("\n## Business Description\n")
        lines.append(business_description.strip())

    lines.extend(file_sections)

    return "\n".join(lines).strip()


@router.post("/upload")
async def upload_readme(
    name: str = Form(...),
    business_type: str = Form(""),
    industry: str = Form(""),
    revenue: str = Form(""),
    products: str = Form(""),
    services: str = Form(""),
    customers: str = Form(""),
    employees: str = Form(""),
    goals: str = Form(""),
    challenges: str = Form(""),
    problems: str = Form(""),
    target_market: str = Form(""),
    business_description: str = Form(""),
    decision_query: str = Form(""),
    website_url: str = Form(""),
    file: UploadFile | None = File(default=None),
    readme_text: str | None = Form(default=None),
    files: list[UploadFile] = File(default=[]),
    user: UserPublic = Depends(get_current_user),
):
    actual_files = list(files)
    if file is not None:
        actual_files.append(file)

    actual_free_text = business_description
    if not actual_free_text.strip() and readme_text:
        actual_free_text = readme_text

    has_fields = any([
        business_type.strip(), industry.strip(), revenue.strip(),
        products.strip(), services.strip(), customers.strip(),
        employees.strip(), goals.strip(), challenges.strip(),
        problems.strip(), target_market.strip(), actual_free_text.strip(),
        decision_query.strip(), website_url.strip(), actual_files
    ])
    if not has_fields:
        raise HTTPException(status.HTTP_400_BAD_REQUEST, "No onboarding data provided")

    await billing_service.assert_can_create_project(user.id)

    file_sections: list[str] = []
    for f in actual_files:
        lower_name = (f.filename or "").lower()
        content = await f.read()
        if lower_name.endswith(_TEXT_EXTENSIONS):
            try:
                text = content.decode("utf-8")
            except UnicodeDecodeError:
                continue
            if text.strip():
                file_sections.append(f"\n## Uploaded File: {f.filename}\n")
                file_sections.append(text.strip())

    generated_markdown = _compose_markdown(
        name=name,
        business_type=business_type,
        industry=industry,
        revenue=revenue,
        products=products,
        services=services,
        customers=customers,
        employees=employees,
        goals=goals,
        challenges=challenges,
        problems=problems,
        target_market=target_market,
        business_description=actual_free_text,
        decision_query=decision_query,
        website_url=website_url,
        file_sections=file_sections,
    )

    if not generated_markdown.strip():
        raise HTTPException(
            status.HTTP_500_INTERNAL_SERVER_ERROR,
            "Generated Markdown is empty"
        )

    project_id = await project_service.create_project(user.id, name, generated_markdown)
    return {"project_id": project_id}
