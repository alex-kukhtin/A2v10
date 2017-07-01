
#include "stdafx.h"
#include "..\include\a2doctemplate.h"


IMPLEMENT_DYNAMIC(CA2DocTemplate, CMultiDocTemplate)

CA2DocTemplate::CA2DocTemplate(UINT nIDResource, CRuntimeClass* pDocClass,
	CRuntimeClass* pFrameClass, CRuntimeClass* pViewClass)
	: CMultiDocTemplate(nIDResource, pDocClass, pFrameClass, pViewClass)
{
	if (m_hMenuShared)
		::DestroyMenu(m_hMenuShared);
	m_hMenuShared = NULL;
}

// virtual 
CA2DocTemplate::~CA2DocTemplate()
{
}

void CA2DocTemplate::LoadTemplate()
{
	CDocTemplate::LoadTemplate();

	if ((m_nIDResource != 0) && (m_hMenuShared == NULL))
	{
		/*
		HINSTANCE hInst = AfxFindResourceHandle(
		MAKEINTRESOURCE(m_nIDResource), RT_MENU);
		m_hMenuShared = ::LoadMenuW(hInst, MAKEINTRESOURCEW(m_nIDResource));
		m_hAccelTable =
		::LoadAcceleratorsW(hInst, MAKEINTRESOURCEW(m_nIDResource));
		*/
		LoadAndMegeMenu();

		HINSTANCE hInst = AfxFindResourceHandle(
			MAKEINTRESOURCE(m_nIDResource), RT_ACCELERATOR);
		m_hAccelTable =
			::LoadAcceleratorsW(hInst, MAKEINTRESOURCEW(m_nIDResource));
	}

#ifdef _DEBUG
	// warnings about missing components (don't bother with accelerators)
	if (m_hMenuShared == NULL)
		TRACE(traceAppMsg, 0, "Warning: no shared menu for document template #%d.\n",
			m_nIDResource);
#endif //_DEBUG
}


void CA2DocTemplate::LoadAndMegeMenu()
{
	HINSTANCE hInst = AfxFindResourceHandle(
		MAKEINTRESOURCE(IDR_MAINFRAME), RT_MENU);
	m_hMenuShared = ::LoadMenuW(hInst, MAKEINTRESOURCEW(IDR_MAINFRAME));

	HINSTANCE hInstDoc = AfxFindResourceHandle(
		MAKEINTRESOURCE(m_nIDResource), RT_MENU);
	HMENU hDocumentMenu = ::LoadMenu(hInstDoc, MAKEINTRESOURCE(m_nIDResource));
	if (hDocumentMenu == NULL)
		return;
	// insert into (count - 3) (Tools, Window, Help);
	int itmPos = max(0, ::GetMenuItemCount(m_hMenuShared) - 3);

	CMenu* pDocumentMenu = CMenu::FromHandle(hDocumentMenu);

	int docMenuCount = pDocumentMenu->GetMenuItemCount();
	CString menuText;
	MENUITEMINFO mii = { 0 };
	mii.cbSize = sizeof(MENUITEMINFO);
	for (int i = 0; i < docMenuCount; i++) {
		pDocumentMenu->GetMenuStringW(i, menuText, MF_BYPOSITION);
		HMENU hSub = ::GetSubMenu(hDocumentMenu, i);
		if (hSub != NULL)
			VERIFY(::InsertMenu(m_hMenuShared, itmPos + i, MF_BYPOSITION | MF_POPUP, (DWORD_PTR)hSub, (LPCWSTR)menuText));
	}
	for (int i = 0; i < docMenuCount; i++) {
		::RemoveMenu(hDocumentMenu, 0, MF_BYPOSITION);
	}
	::DestroyMenu(hDocumentMenu);
}
