#pragma once

class CA2FormTabView : public CA2TabView
{
protected: // create from serialization only
	DECLARE_DYNCREATE(CA2FormTabView)

	virtual void OnCreate();
};
