#pragma once


class CPosThreadWnd : public CWinThread
{
	HWND m_hFrame;
	DECLARE_DYNCREATE(CPosThreadWnd)
public:
	CPosThreadWnd();

	BOOL InitInstance() override;

protected:
	DECLARE_MESSAGE_MAP()

	afx_msg void OnPosCommand(WPARAM wParam, LPARAM lParam);
};
