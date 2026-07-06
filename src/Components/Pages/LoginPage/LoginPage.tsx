import { useRhLoginFlow } from "./useRhLoginFlow";
import { LoginDesktopView } from "./LoginDesktopView";
import { LoginPhoneStep } from "./LoginPhoneStep";
import { LoginVerificationStep } from "./LoginVerificationStep";
import "./LoginPage.scss";

const LoginPage: React.FC = () => {
  const flow = useRhLoginFlow();

  if (flow.isVerificationStep) {
    return (
      <LoginVerificationStep
        otpFormRef={flow.otpFormRef}
        maskedPhone={flow.maskedPhone}
        verificationCode={flow.verificationCode}
        codeResent={flow.codeResent}
        verificationError={flow.verificationError}
        isVerificationCodeValid={flow.isVerificationCodeValid}
        isVerifyingCode={flow.isVerifyingCode}
        isSendingCode={flow.isSendingCode}
        onVerificationNext={flow.onVerificationNext}
        onOtpChange={flow.onOtpChange}
        onResendCode={flow.onResendCode}
        onBack={flow.onBack}
      />
    );
  }

  if (flow.isDesktop) {
    return (
      <LoginDesktopView
        phoneFormRef={flow.phoneFormRef}
        maskedPhone={flow.maskedPhone}
        phoneValue={flow.phoneValue}
        isPhoneValid={flow.isPhoneValid}
        isSendingCode={flow.isSendingCode}
        phoneError={flow.phoneError}
        showNoReportNotice={flow.showNoReportNotice}
        onPhoneNext={flow.onPhoneNext}
        onPhoneChange={flow.onPhoneChange}
        onBack={flow.onBack}
      />
    );
  }

  return (
    <LoginPhoneStep
      phoneFormRef={flow.phoneFormRef}
      maskedPhone={flow.maskedPhone}
      phoneValue={flow.phoneValue}
      isPhoneValid={flow.isPhoneValid}
      isSendingCode={flow.isSendingCode}
      phoneError={flow.phoneError}
      onPhoneNext={flow.onPhoneNext}
      onPhoneChange={flow.onPhoneChange}
      onBack={flow.onBack}
    />
  );
};

export default LoginPage;
